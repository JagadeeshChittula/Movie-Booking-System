const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmation = async (toEmail, bookingDetails) => {
  const { userName, movieTitle, theatreName, showDate, showTime, seats, totalAmount, bookingId } = bookingDetails;
  
  const mailOptions = {
    from: `"CineVault Tickets" <${process.env.EMAIL_USER || "noreply@cinevault.com"}>`,
    to: toEmail,
    subject: `🎬 Booking Confirmed — ${movieTitle}`,
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #e50914, #b20710); padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #fff;">🎬 CineVault</h1>
          <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Your E-Ticket Confirmation</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 16px; margin-bottom: 4px;">Hi <strong>${userName}</strong>,</p>
          <p style="color: #aaa; font-size: 14px;">Your booking has been confirmed! Here are your details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Movie</td><td style="padding: 10px; border-bottom: 1px solid #333; font-weight: 600;">${movieTitle}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Cinema</td><td style="padding: 10px; border-bottom: 1px solid #333;">${theatreName}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Date & Time</td><td style="padding: 10px; border-bottom: 1px solid #333;">${showDate} · ${showTime}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Seats</td><td style="padding: 10px; border-bottom: 1px solid #333; font-weight: 600;">${seats}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #333; color: #aaa;">Amount Paid</td><td style="padding: 10px; border-bottom: 1px solid #333; color: #22c55e; font-weight: 700;">₹${totalAmount}</td></tr>
            <tr><td style="padding: 10px; color: #aaa;">Booking ID</td><td style="padding: 10px; font-family: monospace; font-size: 12px;">${bookingId}</td></tr>
          </table>
          <p style="font-size: 13px; color: #888; margin-top: 16px;">Show your QR code at the cinema entrance. Enjoy the movie! 🍿</p>
        </div>
        <div style="background: #111; padding: 16px; text-align: center; font-size: 12px; color: #666;">
          © CineVault Movie Tickets · This is an automated email
        </div>
      </div>
    `,
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Booking confirmation email sent to ${toEmail}`);
      return true;
    }
    console.log(`📧 Email skipped (EMAIL_USER/EMAIL_PASS not configured)`);
    return false;
  } catch (error) {
    console.error("Email send failed:", error.message);
    return false;
  }
};

const sendPasswordResetEmail = async (toEmail, resetCode, userName) => {
  const mailOptions = {
    from: `"CineVault" <${process.env.EMAIL_USER || "noreply@cinevault.com"}>`,
    to: toEmail,
    subject: "🔐 CineVault Password Reset Code",
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; background: #1a1a2e; color: #eee; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #e50914, #b20710); padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: #fff;">Password Reset</h2>
        </div>
        <div style="padding: 24px; text-align: center;">
          <p>Hi <strong>${userName}</strong>,</p>
          <p style="color: #aaa;">Use this 6-digit code to reset your password:</p>
          <div style="background: #222; border: 2px dashed #e50914; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #e50914;">
            ${resetCode}
          </div>
          <p style="font-size: 13px; color: #888;">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Password reset email sent to ${toEmail}`);
      return true;
    }
    console.log(`📧 Reset email skipped (EMAIL_USER/EMAIL_PASS not configured)`);
    return false;
  } catch (error) {
    console.error("Email send failed:", error.message);
    return false;
  }
};

module.exports = { sendBookingConfirmation, sendPasswordResetEmail };
