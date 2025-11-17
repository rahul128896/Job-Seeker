const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Primary key - unique identifier for each job'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    },
    comment: 'Job title'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [10, 10000]
    },
    comment: 'Detailed job description'
  },
  requirements: {
    type: DataTypes.TEXT,
    defaultValue: '',
    comment: 'Job requirements and qualifications'
  },
  company: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    },
    comment: 'Company name'
  },
  recruiterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    comment: 'Foreign key - reference to recruiter who posted the job'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    },
    comment: 'Job location'
  },
  type: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Remote'),
    allowNull: false,
    validate: {
      isIn: [['Full-time', 'Part-time', 'Remote']]
    },
    comment: 'Job type - Full-time, Part-time, or Remote'
  },
  salaryMin: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    },
    comment: 'Minimum salary'
  },
  salaryMax: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    },
    comment: 'Maximum salary'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Job tags for filtering (experience level, skills, etc.)'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Job status - active or inactive'
  },
  customQuestions: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Custom application questions defined by recruiter'
  }
}, {
  timestamps: true,
  tableName: 'jobs',
  indexes: [
    {
      name: 'idx_recruiter',
      fields: ['recruiterId']
    },
    {
      name: 'idx_location',
      fields: ['location']
    },
    {
      name: 'idx_type',
      fields: ['type']
    },
    {
      name: 'idx_active',
      fields: ['isActive']
    },
    {
      name: 'idx_salary',
      fields: ['salaryMin', 'salaryMax']
    },
    {
      name: 'idx_created_at',
      fields: ['createdAt']
    },
    {
      name: 'idx_company',
      fields: ['company']
    }
  ],
  comment: 'Jobs table - stores all job postings',
  validate: {
    salaryRangeValid() {
      if (this.salaryMin > this.salaryMax) {
        throw new Error('Minimum salary cannot be greater than maximum salary');
      }
    }
  }
});

module.exports = Job; 