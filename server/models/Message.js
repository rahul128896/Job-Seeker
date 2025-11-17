const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Primary key - unique identifier for message'
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Foreign key - reference to message sender'
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Foreign key - reference to message receiver'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 5000]
    },
    comment: 'Message content'
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read'),
    defaultValue: 'sent',
    validate: {
      isIn: [['sent', 'delivered', 'read']]
    },
    comment: 'Message status - sent, delivered, or read'
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'jobs',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Foreign key - reference to related job (optional)'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    comment: 'Message timestamp'
  }
}, {
  timestamps: false,
  tableName: 'messages',
  indexes: [
    {
      name: 'idx_sender',
      fields: ['senderId']
    },
    {
      name: 'idx_receiver',
      fields: ['receiverId']
    },
    {
      name: 'idx_conversation',
      fields: ['senderId', 'receiverId']
    },
    {
      name: 'idx_job_messages',
      fields: ['jobId']
    },
    {
      name: 'idx_status',
      fields: ['status']
    },
    {
      name: 'idx_timestamp',
      fields: ['timestamp']
    }
  ],
  comment: 'Messages table - stores chat messages between users'
});

module.exports = Message; 