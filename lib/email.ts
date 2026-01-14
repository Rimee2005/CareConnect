import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

export const emailTemplates = {
  vitalProfileCreated: (name: string) => ({
    subject: 'Your CareConnect Profile is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #14b8a6;">Welcome to CareConnect, ${name}!</h2>
        <p>Your Vital profile has been successfully created. You can now:</p>
        <ul>
          <li>Browse available Guardians</li>
          <li>Book care services</li>
          <li>Connect with compassionate caregivers</li>
        </ul>
        <p style="color: #2d3748;">We're here to help you find the care you need.</p>
        <p style="margin-top: 30px; color: #718096; font-size: 14px;">
          Care with compassion, anytime, anywhere.
        </p>
      </div>
    `,
  }),
  guardianProfileActivated: (name: string) => ({
    subject: 'Guardian Profile Activated',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #14b8a6;">Welcome to CareConnect, ${name}!</h2>
        <p>Your Guardian profile has been successfully activated. You can now:</p>
        <ul>
          <li>Receive booking requests from Vitals</li>
          <li>Manage your care services</li>
          <li>Make a difference in people's lives</li>
        </ul>
        <p style="color: #2d3748;">Thank you for joining our community of compassionate caregivers.</p>
        <p style="margin-top: 30px; color: #718096; font-size: 14px;">
          Care with compassion, anytime, anywhere.
        </p>
      </div>
    `,
  }),
  bookingAccepted: (vitalName: string, guardianName: string) => ({
    subject: 'Booking Accepted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #22c55e;">Great News, ${vitalName}!</h2>
        <p>Your booking request has been accepted by <strong>${guardianName}</strong>.</p>
        <p>You can now connect with your Guardian through the platform.</p>
        <p style="margin-top: 30px; color: #718096; font-size: 14px;">
          Care with compassion, anytime, anywhere.
        </p>
      </div>
    `,
  }),
  bookingRejected: (vitalName: string, guardianName: string) => ({
    subject: 'Booking Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2d3748;">Booking Update</h2>
        <p>Unfortunately, your booking request with <strong>${guardianName}</strong> could not be accepted at this time.</p>
        <p>Don't worry - there are many other compassionate Guardians available. Please browse our platform to find another match.</p>
        <p style="margin-top: 30px; color: #718096; font-size: 14px;">
          Care with compassion, anytime, anywhere.
        </p>
      </div>
    `,
  }),
};

