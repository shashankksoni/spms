const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY); // ✅ Uses env variable for security

const sendReminderEmail = async (email, name) => {
  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev', // ✅ Or your verified sender
      to: email,
      subject: 'SPMS Reminder: Stay Active on Codeforces',
      html: `<p>Hi <strong>${name}</strong>,</p>
             <p>We noticed you haven't been active on Codeforces recently.</p>
             <p>Don't forget to practice and maintain your progress!</p>
             <br/>
             <p>– SPMS Team</p>`
    });

    console.log('Reminder email sent:', response);
  } catch (error) {
    console.error('Email failed:', error);
  }
};

module.exports = sendReminderEmail;