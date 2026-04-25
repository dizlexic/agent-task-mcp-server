// server/utils/email-templates.ts

const baseLayout = (content: string) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
    <div style="text-align: center; padding-bottom: 20px;">
        <img src="https://mootasks.dev/logo.svg" alt="Moo Tasks Logo" style="width: 50px; height: 50px;">
    </div>
    <h1 style="color: #333; text-align: center;">Moo Tasks</h1>
    <div style="background-color: white; padding: 20px; border-radius: 8px;">
        ${content}
    </div>
    <p style="margin-top: 30px; font-size: 12px; color: #888; text-align: center;">This is an automated email from Moo Tasks.</p>
  </div>
`;

export const getVerificationEmail = (url: string) => ({
  subject: 'Verify your email address',
  text: `Please verify your email address by clicking the following link: ${url}`,
  html: baseLayout(`
    <p>Welcome to Moo Tasks! Please verify your email address to get started.</p>
    <p style="text-align: center;"><a href="${url}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
  `),
});

export const getPasswordResetEmail = (url: string) => ({
  subject: 'Reset your password',
  text: `You requested a password reset. Click the following link to reset your password: ${url}`,
  html: baseLayout(`
    <p>You requested a password reset for your Moo Tasks account.</p>
    <p style="text-align: center;"><a href="${url}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
  `),
});
