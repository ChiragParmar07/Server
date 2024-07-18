import 'reflect-metadata';
import nodemailer from 'nodemailer';
import { EmailSendUtil } from './emailSend'; // Adjust the path as necessary

jest.mock('nodemailer');

describe('EmailSendUtil', () => {
  const mockedSendMail = jest.fn();

  beforeAll(() => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockedSendMail,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send an email successfully', async () => {
    mockedSendMail.mockImplementation((options, callback) => {
      callback(null, { accepted: [options.to], rejected: [], response: '250 OK' });
    });

    const options = {
      email: 'user@example.com',
      subject: 'Test Subject',
      message: 'Test Message',
      html: '<h1>Test Email</h1>',
    };

    const result = await EmailSendUtil.sendEmail(options);

    expect(mockedSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: process.env.EMAIL_USERNAME,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
      }),
      expect.any(Function)
    );

    expect(result).toEqual({ accepted: [options.email], rejected: [], response: '250 OK' });
  });

  it('should handle errors when sending an email', async () => {
    mockedSendMail.mockImplementation((options, callback) => {
      callback(new Error('Email sending failed'), null);
    });

    const options = {
      email: 'user@example.com',
      subject: 'Test Subject',
      message: 'Test Message',
      html: '<h1>Test Email</h1>',
    };

    await expect(EmailSendUtil.sendEmail(options)).rejects.toThrow('Email sending failed');
  });
});
