const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// Save a job
const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already saved
    const existingSavedJob = await SavedJob.findOne({
      where: {
        seekerId: req.user.id,
        jobId: jobId
      }
    });

    if (existingSavedJob) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    // Create saved job
    const savedJob = await SavedJob.create({
      seekerId: req.user.id,
      jobId: jobId
    });

    const savedJobWithDetails = await SavedJob.findByPk(savedJob.id, {
      include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'company', 'location', 'type', 'salaryMin', 'salaryMax'] }]
    });

    res.status(201).json(savedJobWithDetails);
  } catch (error) {
    console.error('Save job error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Unsave a job
const unsaveJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOne({
      where: {
        seekerId: req.user.id,
        jobId: jobId
      }
    });

    if (!savedJob) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    await savedJob.destroy();
    res.json({ message: 'Job removed from saved jobs' });
  } catch (error) {
    console.error('Unsave job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's saved jobs
const getSavedJobs = async (req, res) => {
  try {
    const savedJobs = await SavedJob.findAll({
      where: { seekerId: req.user.id },
      include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'company', 'location', 'type', 'salaryMin', 'salaryMax', 'createdAt'] }],
      order: [['createdAt', 'DESC']]
    });

    res.json(savedJobs);
  } catch (error) {
    console.error('Get saved jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Check if a job is saved
const checkIfSaved = async (req, res) => {
  try {
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOne({
      where: {
        seekerId: req.user.id,
        jobId: jobId
      }
    });

    res.json({ isSaved: !!savedJob });
  } catch (error) {
    console.error('Check if saved error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkIfSaved
}; 