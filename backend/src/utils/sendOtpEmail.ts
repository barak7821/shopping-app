import { sendEmail } from "./emailService.js";

export const sendOtpEmail = async (to: string, otp: string) => {
  await sendEmail({
    to,
    subject: `Reset your password - ${process.env.APP_NAME}`,
    html: `
      <div style="font-family: 'Montserrat', Arial, sans-serif; background-color: #faf8f6; padding: 40px; color: #232323;">
        <div style="max-width: 520px; margin: auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 40px 30px; text-align: center;">
          
          <!-- Title -->
          <h2 style="font-family: 'Prata', serif; font-size: 26px; font-weight: 700; color: #1a1a1a; margin-bottom: 10px;">
            Reset Your Password
          </h2>

          <!-- Subtitle -->
          <p style="font-size: 15px; color: #555; margin-bottom: 25px; line-height: 1.6; mso-line-height-rule: exactly;">
            We received a request to reset the password for your
            <strong style="color: #c1a875; text-decoration: none;">${process.env.APP_NAME}</strong>
            account.<br/>
            Enter the confirmation code below to continue.
          </p>

          <!-- OTP Box -->
          <div style="display: inline-block; background-color: #faf8f6; border: 1px solid #c1a875; color: #1a1a1a; font-size: 24px; font-weight: 700; letter-spacing: 4px; padding: 15px 30px; border-radius: 12px; margin: 20px 0;">
            ${otp}
          </div>

          <!-- Expiration -->
          <p style="font-size: 13px; color: #888; margin-top: 10px;">
            This code will expire in <strong>5 minutes</strong>.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

          <!-- Footer -->
          <p style="font-size: 12px; color: #aaa; line-height: 1.4;">
            If you didn’t request a password reset, please ignore this email.<br/>
            — The <span style="color: #c1a875; font-weight: 600;">${process.env.APP_NAME}</span> Team
          </p>
        </div>

        <!-- Force link color reset for Gmail -->
        <style>
          a, span, strong { color: #c1a875 !important; text-decoration: none !important; }
        </style>
      </div>
`,
    meta: {
      type: "otp",
      userEmail: to
    }
  })
}
