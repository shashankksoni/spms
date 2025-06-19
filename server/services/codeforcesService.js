const axios = require('axios');
const Student = require('../models/student');

const fetchAndUpdateStudentCFData = async (student) => {
  try {
    const handle = student.cfHandle;

    const response = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    const data = response.data.result[0];

    student.currentRating = data.rating || null;
    student.maxRating = data.maxRating || null;
    student.lastSynced = new Date();
    student.cfData = data;

    await student.save();
    console.log(`✔ Updated Codeforces data for ${student.name}`);
  } catch (error) {
    console.error(`❌ Failed to update Codeforces data for ${student.name}:`, error.message);
  }
};

module.exports = { fetchAndUpdateStudentCFData };
