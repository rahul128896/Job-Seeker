const Message = require('../models/Message');
const User = require('../models/User');
const Application = require('../models/Application');
const { Op } = require('sequelize');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, jobId } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver and message are required' });
    }
    
    const newMessage = await Message.create({
      senderId: req.user.id,
      receiverId,
      message,
      jobId: jobId || null,
      status: 'sent',
      timestamp: new Date()
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages between two users (optionally for a job)
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params; // The other user
    const { jobId } = req.query; // Optional job context
    
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }
    
    const where = {
      [Op.or]: [
        { senderId: req.user.id, receiverId: userId },
        { senderId: userId, receiverId: req.user.id }
      ]
    };
    
    if (jobId) where.jobId = jobId;
    
    let messages = await Message.findAll({
      where,
      order: [['timestamp', 'ASC']]
    });

    // Mark messages sent to current user as 'delivered' if still 'sent'
    const undelivered = messages.filter(
      m => m.receiverId === req.user.id && m.status === 'sent'
    );
    
    if (undelivered.length > 0) {
      await Message.update(
        { status: 'delivered' },
        { where: { id: { [Op.in]: undelivered.map(m => m.id) } } }
      );
      // Re-fetch messages to get updated status
      messages = await Message.findAll({
        where,
        order: [['timestamp', 'ASC']]
      });
    }

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all messages from other user to current user as 'read' (for a job)
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params; // The other user
    const { jobId } = req.body; // job context
    
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }
    
    const where = {
      senderId: userId,
      receiverId: req.user.id,
      status: { [Op.ne]: 'read' }
    };
    
    if (jobId) where.jobId = jobId;
    
    await Message.update(
      { status: 'read' },
      { where }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByPk(id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Only sender or receiver can delete
    if (
      message.senderId !== req.user.id &&
      message.receiverId !== req.user.id
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    await message.destroy();
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage
}; 