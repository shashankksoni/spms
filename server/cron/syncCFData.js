// cron/syncCFData.js
const cron = require('node-cron');
const axios = require('axios');
const Student = require('../models/student');
const sendReminderEmail = require('../services/emailService');

// ⏳ Delay utility to pause between emails
const delay = ms => new Promise(res => setTimeout(res, ms));

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
      console.log(`✅ Updated: ${student.name} (${student.cfHandle})`);

      // 📨 Send email reminder
      const emailResult = await sendReminderEmail(student.email, student.name);
      console.log('📧 Reminder email sent to', student.email);
      console.log('Reminder email result:', emailResult);

    } catch (err) {
      console.error(`❌ Failed to update ${student.cfHandle}:`, err.message);
    }

    // ⏱ Add delay between each student to prevent rate limit
    await delay(600); // ~1.5 requests/sec
  }
};

const scheduleCFDataSync = () => {
  // Runs every day at 2 AM
  cron.schedule('0 2 * * *', syncCodeforcesData);
  console.log('[CRON] CF Data sync scheduled for 2 AM daily.');
};

module.exports = syncCodeforcesData;
module.exports.scheduleCFDataSync = scheduleCFDataSync;
