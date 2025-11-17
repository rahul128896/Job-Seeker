const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// Apply for a job
const applyForJob = async (req, res) => {
  try {
    const { jobId, name, email, resumeUrl, coverLetter, customAnswers } = req.body;

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      where: {
        seekerId: req.user.id,
        jobId: jobId
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Use user info if not provided
    const user = req.user;
    const applicantName = name || user.name;
    const applicantEmail = email || user.email;

    // Create application
    const application = await Application.create({
      seekerId: req.user.id,
      jobId: jobId,
      name: applicantName,
      email: applicantEmail,
      resumeUrl,
      coverLetter,
      customAnswers: customAnswers || {}
    });

    const applicationWithDetails = await Application.findByPk(application.id, {
      include: [
        { model: User, as: 'seeker', attributes: ['id', 'name', 'email'] },
        { model: Job, as: 'job', attributes: ['id', 'title', 'company'] }
      ]
    });

    res.status(201).json(applicationWithDetails);
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get applications for a specific job (recruiter only)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Check if job belongs to the recruiter
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.findAll({
      where: { jobId },
      include: [
        { model: User, as: 'seeker', attributes: ['id', 'name', 'email', 'location', 'skills', 'bio'] },
        { model: Job, as: 'job', attributes: ['id', 'title', 'company'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(applications);
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's applications (seeker only)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { seekerId: req.user.id },
      include: [{
        model: Job,
        as: 'job',
        attributes: ['id', 'title', 'company', 'location', 'type', 'salaryMin', 'salaryMax', 'recruiterId'],
        include: [{ model: User, as: 'recruiter', attributes: ['id', 'name'] }]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update application status (recruiter only)
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await Application.findByPk(id, {
      include: [{ model: Job, as: 'job', attributes: ['id', 'recruiterId'] }]
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if job belongs to the recruiter
    if (application.job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await application.update({ status });

    const updatedApplication = await Application.findByPk(id, {
      include: [
        { model: User, as: 'seeker', attributes: ['id', 'name', 'email'] },
        { model: Job, as: 'job', attributes: ['id', 'title', 'company'] }
      ]
    });

    res.json(updatedApplication);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update application (seeker only)
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, resumeUrl, coverLetter, customAnswers } = req.body;
    
    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Only the owner (seeker) can update
    if (application.seekerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await application.update({
      name,
      email,
      resumeUrl,
      coverLetter,
      customAnswers
    });

    const updatedApplication = await Application.findByPk(id, {
      include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'company'] }]
    });
    
    res.json(updatedApplication);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete application (seeker only)
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByPk(id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Only the owner (seeker) can delete
    if (application.seekerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await application.destroy();
    res.json({ message: 'Application withdrawn' });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  applyForJob,
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  updateApplication,
  deleteApplication
}; 