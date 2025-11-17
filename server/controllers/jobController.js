const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get all jobs with filters
const getJobs = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      type, 
      minSalary, 
      maxSalary, 
      tags,
      page = 1,
      limit = 10
    } = req.query;

    const where = { isActive: true };

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } }
      ];
    }

    if (location) {
      where.location = { [Op.like]: `%${location}%` };
    }

    if (type) {
      where.type = type;
    }

    if (minSalary) {
      where.salaryMin = { [Op.gte]: parseInt(minSalary) };
    }

    if (maxSalary) {
      where.salaryMax = { [Op.lte]: parseInt(maxSalary) };
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['id', 'name', 'company']
      }],
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    // Format response to include salaryRange object for frontend compatibility
    const formattedJobs = jobs.map(job => {
      const jobData = job.toJSON();
      return {
        ...jobData,
        salaryRange: {
          min: jobData.salaryMin,
          max: jobData.salaryMax
        }
      };
    });

    res.json({
      jobs: formattedJobs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalJobs: count
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recruiter's jobs
const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { recruiterId: req.user.id },
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['id', 'name', 'company']
      }],
      order: [['createdAt', 'DESC']]
    });

    // Format response to include salaryRange object
    const formattedJobs = jobs.map(job => {
      const jobData = job.toJSON();
      return {
        ...jobData,
        salaryRange: {
          min: jobData.salaryMin,
          max: jobData.salaryMax
        }
      };
    });

    res.json({ jobs: formattedJobs });
  } catch (error) {
    console.error('Get recruiter jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single job
const getJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'recruiter',
          attributes: ['id', 'name', 'company', 'website']
        },
        {
          model: Application,
          as: 'applications'
        }
      ]
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Format response to include salaryRange object
    const jobData = job.toJSON();
    const formattedJob = {
      ...jobData,
      salaryRange: {
        min: jobData.salaryMin,
        max: jobData.salaryMax
      }
    };

    res.json(formattedJob);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create job (recruiter only)
const createJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      company, 
      location, 
      jobType, 
      experienceLevel,
      requirements,
      salaryRange, 
      isActive = true,
      customQuestions = []
    } = req.body;

    // Validate required fields
    if (!title || !description || !company || !location || !salaryRange) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Map jobType to the expected enum values
    let type;
    switch (jobType) {
      case 'full-time':
        type = 'Full-time';
        break;
      case 'part-time':
        type = 'Part-time';
        break;
      case 'contract':
      case 'internship':
      case 'freelance':
        type = 'Remote';
        break;
      default:
        type = 'Full-time';
    }

    const job = await Job.create({
      title,
      description,
      requirements: requirements || '',
      company,
      recruiterId: req.user.id,
      location,
      type,
      salaryMin: salaryRange.min,
      salaryMax: salaryRange.max,
      isActive,
      tags: [experienceLevel, jobType].filter(Boolean),
      customQuestions
    });

    const jobWithRecruiter = await Job.findByPk(job.id, {
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['id', 'name', 'company']
      }]
    });

    res.status(201).json(jobWithRecruiter);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update job (recruiter only)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, requirements, company, location, jobType, experienceLevel, salaryRange, isActive, customQuestions } = req.body;

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (requirements !== undefined) updateFields.requirements = requirements;
    if (company) updateFields.company = company;
    if (location) updateFields.location = location;
    if (jobType) {
      let type;
      switch (jobType) {
        case 'full-time':
          type = 'Full-time';
          break;
        case 'part-time':
          type = 'Part-time';
          break;
        case 'contract':
        case 'internship':
        case 'freelance':
          type = 'Remote';
          break;
        default:
          type = 'Full-time';
      }
      updateFields.type = type;
    }
    if (salaryRange) {
      updateFields.salaryMin = salaryRange.min;
      updateFields.salaryMax = salaryRange.max;
    }
    if (experienceLevel) updateFields.tags = [experienceLevel, jobType].filter(Boolean);
    if (typeof isActive === 'boolean') updateFields.isActive = isActive;
    if (customQuestions !== undefined) updateFields.customQuestions = customQuestions;

    await job.update(updateFields);

    const updatedJob = await Job.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'recruiter',
        attributes: ['id', 'name', 'company']
      }]
    });

    res.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete job (recruiter only)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await job.destroy();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getJobs,
  getRecruiterJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob
}; 