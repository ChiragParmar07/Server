import nodemailer from 'nodemailer';

export class EmailSendUtil {
  public static async sendEmail(options: any) {
    // 1) validation of who is sending and authorization to send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // false for TLS, true for SSL
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 2) defining whom to send and all other options (header, message, etc.)
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    // 3) now actually send the email
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error: any, info: any) => {
        if (error) {
          console.log('error', error);
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
}
