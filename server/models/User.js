const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    comment: 'Primary key - unique identifier for each user'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    },
    comment: 'User full name'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      name: 'unique_email',
      msg: 'Email address already exists'
    },
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      },
      notEmpty: true
    },
    comment: 'User email - unique across system'
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 255]
    },
    comment: 'Hashed password'
  },
  role: {
    type: DataTypes.ENUM('seeker', 'recruiter', 'admin'),
    allowNull: false,
    validate: {
      isIn: [['seeker', 'recruiter', 'admin']]
    },
    comment: 'User role - seeker, recruiter, or admin'
  },
  avatar: {
    type: DataTypes.STRING(500),
    defaultValue: '',
    comment: 'URL to user avatar image'
  },
  location: {
    type: DataTypes.STRING(255),
    defaultValue: '',
    comment: 'User location/city'
  },
  bio: {
    type: DataTypes.TEXT,
    defaultValue: '',
    comment: 'User biography/description'
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Array of skills (for job seekers)'
  },
  company: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Company name (for recruiters)'
  },
  website: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: true
    },
    comment: 'Company website URL (for recruiters)'
  }
}, {
  timestamps: true,
  tableName: 'users',
  indexes: [
    {
      name: 'idx_email',
      unique: true,
      fields: ['email']
    },
    {
      name: 'idx_role',
      fields: ['role']
    },
    {
      name: 'idx_created_at',
      fields: ['createdAt']
    }
  ],
  comment: 'Users table - stores all user accounts (seekers, recruiters, admins)'
});

module.exports = User; 