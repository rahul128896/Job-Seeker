const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Primary key - unique identifier for each application'
  },
  seekerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Foreign key - reference to job seeker'
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Foreign key - reference to job posting'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    },
    comment: 'Applicant name'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    },
    comment: 'Applicant email'
  },
  resumeUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true,
      isUrl: true
    },
    comment: 'URL to uploaded resume document'
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 5000]
    },
    comment: 'Cover letter text'
  },
  customAnswers: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: 'Answers to custom questions from recruiter'
  },
  status: {
    type: DataTypes.ENUM('Applied', 'Viewed', 'Interview', 'Shortlisted', 'Rejected', 'Hired', 'Reviewed'),
    defaultValue: 'Applied',
    validate: {
      isIn: [['Applied', 'Viewed', 'Interview', 'Shortlisted', 'Rejected', 'Hired', 'Reviewed']]
    },
    comment: 'Application status in recruitment pipeline'
  }
}, {
  timestamps: true,
  tableName: 'applications',
  indexes: [
    {
      name: 'unique_seeker_job',
      unique: true,
      fields: ['seekerId', 'jobId'],
      msg: 'User has already applied for this job'
    },
    {
      name: 'idx_seeker',
      fields: ['seekerId']
    },
    {
      name: 'idx_job',
      fields: ['jobId']
    },
    {
      name: 'idx_status',
      fields: ['status']
    },
    {
      name: 'idx_created_at',
      fields: ['createdAt']
    }
  ],
  comment: 'Applications table - stores job applications from seekers'
});

module.exports = Application; 