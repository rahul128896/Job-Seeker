const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'job_portal',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log, // Enable SQL query logging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true
    }
  }
);

const connectDB = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✓ MySQL Database Connected Successfully');
    console.log(`✓ Database: ${process.env.DB_NAME || 'job_portal'}`);
    console.log(`✓ Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    
    // Sync all models - create tables if they don't exist
    await sequelize.sync({ alter: true }); // Use alter to update existing tables
    console.log('✓ Database tables synchronized successfully');
    console.log('✓ Tables created: users, jobs, applications, saved_jobs, messages');
    
  } catch (error) {
    console.error('✗ Error connecting to MySQL:', error.message);
    console.error('✗ Please ensure:');
    console.error('  1. MySQL server is running');
    console.error('  2. Database "job_portal" exists');
    console.error('  3. Username and password in .env are correct');
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
