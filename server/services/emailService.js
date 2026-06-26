const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendBookingConfirmation(userEmail, bookingDetails) {
  try {
    await transporter.sendMail({
      from: `"CineMatch" <${process.env.SMTP_USER}>`,
      to: userEmail,
      subject: 'Booking Confirmed - CineMatch',
      html: `
        <h1>Booking Confirmed!</h1>
        <p><strong>Movie:</strong> ${bookingDetails.movieTitle}</p>
        <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${bookingDetails.time}</p>
        <p><strong>Seats:</strong> ${bookingDetails.seats.join(', ')}</p>
        <p><strong>Total:</strong> ${bookingDetails.totalPrice} TL</p>
        <p>Show this QR code at the entrance:</p>
        <img src="${bookingDetails.qrCode}" alt="QR Code" style="width:200px;height:200px;"/>
        <p>Enjoy your movie!</p>
      `
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
}

module.exports = { sendBookingConfirmation };
