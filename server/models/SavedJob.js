const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SavedJob = sequelize.define('SavedJob', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Primary key - unique identifier for saved job'
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
  }
}, {
  timestamps: true,
  tableName: 'saved_jobs',
  indexes: [
    {
      name: 'unique_saved_job',
      unique: true,
      fields: ['seekerId', 'jobId'],
      msg: 'Job already saved by this user'
    },
    {
      name: 'idx_seeker_saved',
      fields: ['seekerId']
    },
    {
      name: 'idx_job_saved',
      fields: ['jobId']
    },
    {
      name: 'idx_created_at_saved',
      fields: ['createdAt']
    }
  ],
  comment: 'Saved Jobs table - stores jobs bookmarked by seekers'
});

module.exports = SavedJob; 