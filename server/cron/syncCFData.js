// cron/syncCFData.js
const cron = require('node-cron');
const axios = require('axios');
const Student = require('../models/student');

const syncCodeforcesData = async () => {
  console.log('[CRON] Syncing Codeforces data...');

  const students = await Student.find();

  for (let student of students) {
    if (!student.cfHandle) continue;

    try {
      const res = await axios.get(`https://codeforces.com/api/user.info?handles=${student.cfHandle}`);
      const info = res.data.result[0];

      student.currentRating = info.rating || null;
      student.maxRating = info.maxRating || null;
      student.lastSynced = new Date();
      student.cfData = info;

      await student.save();
      console.log(`Updated: ${student.name} (${student.cfHandle})`);

    } catch (err) {
      console.error(`Failed to update ${student.cfHandle}:`, err.message);
    }
  }
};

const scheduleCFDataSync = () => {
  // Runs every day at 2 AM
  cron.schedule('0 2 * * *', syncCodeforcesData);
  console.log('[CRON] CF Data sync scheduled for 2 AM daily.');
};

module.exports = syncCodeforcesData;
module.exports.scheduleCFDataSync = scheduleCFDataSync;
