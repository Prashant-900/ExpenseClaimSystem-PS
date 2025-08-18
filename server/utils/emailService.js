import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendStatusUpdateEmail = async (to, reimbursement, status, remarks = '') => {
  const subject = `Reimbursement Request ${status}`;
  const html = `
    <h3>Reimbursement Status Update</h3>
    <p><strong>Amount:</strong> $${reimbursement.amount}</p>
    <p><strong>Description:</strong> ${reimbursement.description}</p>
    <p><strong>Status:</strong> ${status}</p>
    ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ''}
  `;

  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
  } catch (error) {
    console.error('Email send error:', error);
  }
};