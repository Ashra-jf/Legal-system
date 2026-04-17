const nodemailer = require('nodemailer');

// For development without real credentials, we will log a warning if env not set
// but still attempt if provided. In production, these must be set.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com',
        pass: process.env.EMAIL_PASS || 'password'
    }
});

exports.sendVerificationEmail = async (toEmail, code) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Faking email send...');
        console.log(`[EMAIL PREVIEW] To: ${toEmail} | Code: ${code}`);
        return; // Skip actual sending if credentials are not configured
    }

    const mailOptions = {
        from: `"DNJ Legal Firm" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Verify Your Email Address - DNJ Legal Firm',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Welcome to DNJ Legal Firm!</h2>
                <p>Please use the following 6-digit code to verify your email address. This code will expire in 15 minutes.</p>
                <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
                    ${code}
                </div>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${toEmail}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Could not send verification email');
    }
};
