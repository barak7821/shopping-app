import nodemailer from "nodemailer"

export const sendOtpEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  await transporter.sendMail({
    from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Reset your password - ${process.env.APP_NAME}`,
    html: `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
    <div style="max-width: 500px; margin: auto; background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p style="color: #555;">We received a request to reset the password for your <strong>${process.env.APP_NAME}</strong> account.</p>
      <p style="color: #555;">Enter the following confirmation code to continue:</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; color: #2b6cb0;">${otp}</div>
      <p style="color: #999;">This code will expire in 5 minutes.</p>
    </div>
  </div>
`
  })
}