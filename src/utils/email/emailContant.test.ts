import 'reflect-metadata';
import { forgotPasswordEmail } from './emailContant'; // Adjust the path as necessary
import { EmailSendUtil } from './emailSend'; // Adjust if necessary

jest.mock('./emailSend'); // Mock the entire emailSend module

describe('forgotPasswordEmail', () => {
  const mockSendEmail = EmailSendUtil.sendEmail as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call sendEmail with the correct parameters', async () => {
    const resetToken = 'sampleResetToken';
    const email = 'user@example.com';
    const name = 'John Doe';
    process.env.SERVER_URL = 'http://localhost:3000'; // Set up environment variable

    await forgotPasswordEmail(resetToken, email, name);

    expect(mockSendEmail).toHaveBeenCalledWith({
      email: email,
      subject: 'Your password reset token (valid for only 10 minutes)',
      message: '',
      html: expect.stringContaining(`<h1>Hello ${name},</h1>`),
    });

    expect(mockSendEmail).toHaveBeenCalledTimes(1);
  });

  it('should include the reset URL in the email HTML', async () => {
    const resetToken = 'sampleResetToken';
    const email = 'user@example.com';
    const name = 'John Doe';
    process.env.SERVER_URL = 'http://localhost:3000';

    await forgotPasswordEmail(resetToken, email, name);

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining(`http://localhost:3000/user/resetpassword/${resetToken}`),
      })
    );
  });

  it('should handle errors from sendEmail gracefully', async () => {
    const resetToken = 'sampleResetToken';
    const email = 'user@example.com';
    const name = 'John Doe';
    process.env.SERVER_URL = 'http://localhost:3000';

    mockSendEmail.mockRejectedValueOnce(new Error('Email sending failed'));

    await expect(forgotPasswordEmail(resetToken, email, name)).rejects.toThrow('Email sending failed');
  });
});
