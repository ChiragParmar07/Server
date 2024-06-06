import { EmailSendUtil } from './emailSend';

export const forgotPasswordEmail = async (resetToken: string, email: string, name: string) => {
  const resetURL = `${process.env.SERVER_URL}/user/resetpassword/${resetToken}`;
  const html = `
                  <html>
                  <head>
                      <style>
                          body {
                              font-family: Arial, sans-serif;
                              background-color: #f0f0f0;
                              margin: 0;
                              padding: 0;
                          }
                          .container {
                              max-width: 600px;
                              margin: auto;
                              padding: 20px;
                              background-color: #fff;
                              border-radius: 10px;
                              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                          }
                          h1, h2, p {
                              color: #333;
                          }
                          a {
                              color: #007BFF;
                              text-decoration: none;
                          }
                          a:hover {
                              color: #0056b3;
                          }
                          button {
                              background-color: #007BFF;
                              color: #fff;
                              padding: 10px 20px;
                              border: none;
                              border-radius: 5px;
                              cursor: pointer;
                          }
                          button:hover {
                              background-color: #0056b3;
                          }
                      </style>
                  </head>
                  <body>
                      <div class="container">
                          <h1>Hello ${name},</h1>
                          <p>We received a request to reset your password. To proceed, please click the button below:</p>
                          <a href="${resetURL}"><button>Reset Password</button></a>
                          <p>This link will expire in 10 minutes.</p>
                          <p>If you did not request a password reset, please ignore this email.</p>
                          <p>Thanks, Article Posting Team</p>
                          <footer>
                              <p>© 2024 Article Posting. All rights reserved.</p>
                          </footer>
                      </div>
                  </body>
                  </html>`;

  await EmailSendUtil.sendEmail({
    email: email,
    subject: 'Your password reset token (valid for only 10 minutes)',
    message: '',
    html: html,
  });
};
