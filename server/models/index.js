const User = require('./User');
const Job = require('./Job');
const Application = require('./Application');
const SavedJob = require('./SavedJob');
const Message = require('./Message');

// Define associations
User.hasMany(Job, { foreignKey: 'recruiterId', as: 'jobs' });
Job.belongsTo(User, { foreignKey: 'recruiterId', as: 'recruiter' });

User.hasMany(Application, { foreignKey: 'seekerId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'seekerId', as: 'seeker' });

Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

User.hasMany(SavedJob, { foreignKey: 'seekerId', as: 'savedJobs' });
SavedJob.belongsTo(User, { foreignKey: 'seekerId', as: 'seeker' });

Job.hasMany(SavedJob, { foreignKey: 'jobId', as: 'savedBy' });
SavedJob.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

Job.hasMany(Message, { foreignKey: 'jobId', as: 'messages' });
Message.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

module.exports = {
  User,
  Job,
  Application,
  SavedJob,
  Message
};
