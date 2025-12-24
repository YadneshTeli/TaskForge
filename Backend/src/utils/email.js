import crypto from 'crypto';
import sgMail from '@sendgrid/mail';

/**
 * Email service for sending verification, password reset, and notification emails
 * Integrated with SendGrid for production email delivery
 */

class EmailService {
  constructor() {
    this.from = process.env.EMAIL_FROM || 'noreply@taskforge.com';
    this.enabled = process.env.EMAIL_ENABLED === 'true';
    
    // Initialize SendGrid if enabled
    if (this.enabled && process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('✅ SendGrid initialized');
    } else if (this.enabled && !process.env.SENDGRID_API_KEY) {
      console.warn('⚠️  EMAIL_ENABLED=true but SENDGRID_API_KEY not set. Emails will be logged only.');
      this.enabled = false;
    }
  }
  
  /**
   * Send email via SendGrid
   */
  async sendEmail(to, subject, html, text = '') {
    try {
      const msg = {
        to,
        from: this.from,
        subject,
        text,
        html
      };
      
      await sgMail.send(msg);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('❌ SendGrid Error:', error.response?.body || error.message);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Generate a secure random token
   */
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email, token, username) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    if (!this.enabled) {
      console.log('📧 Email Service (DEV MODE):');
      console.log(`To: ${email}`);
      console.log(`Subject: Verify your email for TaskForge`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('---');
      return { success: true, message: 'Email logged (dev mode)' };
    }

    // Send actual email via SendGrid
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Verify Your Email</h2>
        <p>Hi <strong>${username}</strong>,</p>
        <p>Thanks for signing up for TaskForge! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #4F46E5; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link expires in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you didn't create a TaskForge account, you can safely ignore this email.</p>
      </div>
    `;
    
    return await this.sendEmail(
      email,
      'Verify your email for TaskForge',
      html,
      `Hi ${username}, please verify your email by visiting: ${verificationUrl}`
    );
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email, token, username) {
    return this.sendVerificationEmail(email, token, username);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, token, username) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    if (!this.enabled) {
      console.log('📧 Email Service (DEV MODE):');
      console.log(`To: ${email}`);
      console.log(`Subject: Reset your TaskForge password`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('---');
      return { success: true, message: 'Email logged (dev mode)' };
    }

    // Send actual email via SendGrid
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Reset Your Password</h2>
        <p>Hi <strong>${username}</strong>,</p>
        <p>We received a request to reset your password for your TaskForge account. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #4F46E5; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link expires in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      </div>
    `;
    
    return await this.sendEmail(
      email,
      'Reset your TaskForge password',
      html,
      `Hi ${username}, reset your password by visiting: ${resetUrl}`
    );
  }

  /**
   * Send team invitation email
   */
  async sendInvitationEmail(email, token, invitedBy, projectName = null) {
    const inviteUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${token}`;
    
    if (!this.enabled) {
      console.log('📧 Email Service (DEV MODE):');
      console.log(`To: ${email}`);
      console.log(`Subject: You've been invited to TaskForge`);
      console.log(`Invitation URL: ${inviteUrl}`);
      console.log(`Invited by: ${invitedBy}`);
      if (projectName) console.log(`Project: ${projectName}`);
      console.log('---');
      return { success: true, message: 'Email logged (dev mode)' };
    }

    // Send actual email via SendGrid
    const projectInfo = projectName ? `to join the <strong>${projectName}</strong> project` : '';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">You've Been Invited to TaskForge!</h2>
        <p><strong>${invitedBy}</strong> has invited you ${projectInfo} on TaskForge.</p>
        <p>TaskForge is a powerful project management tool that helps teams collaborate and stay organized.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #4F46E5; word-break: break-all;">${inviteUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This invitation expires in 7 days.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">If you weren't expecting this invitation, you can safely ignore this email.</p>
      </div>
    `;
    
    return await this.sendEmail(
      email,
      `You've been invited to TaskForge by ${invitedBy}`,
      html,
      `You've been invited to TaskForge by ${invitedBy}. Accept invitation: ${inviteUrl}`
    );
  }

  /**
   * Send welcome email after successful signup
   */
  async sendWelcomeEmail(email, username) {
    if (!this.enabled) {
      console.log('📧 Email Service (DEV MODE):');
      console.log(`To: ${email}`);
      console.log(`Subject: Welcome to TaskForge!`);
      console.log(`Username: ${username}`);
      console.log('---');
      return { success: true, message: 'Email logged (dev mode)' };
    }

    // Send actual email via SendGrid
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to TaskForge! 🎉</h2>
        <p>Hi <strong>${username}</strong>,</p>
        <p>We're excited to have you on board! TaskForge helps you manage projects, track tasks, and collaborate with your team efficiently.</p>
        <h3 style="color: #333;">Get Started:</h3>
        <ul style="line-height: 1.8;">
          <li>Create your first project</li>
          <li>Add tasks and assign team members</li>
          <li>Track progress with real-time analytics</li>
          <li>Collaborate with comments and notifications</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">Need help? Check out our <a href="${process.env.FRONTEND_URL}/help" style="color: #4F46E5;">Help Center</a> or contact support.</p>
      </div>
    `;
    
    return await this.sendEmail(
      email,
      'Welcome to TaskForge! 🎉',
      html,
      `Welcome to TaskForge, ${username}! Get started at ${process.env.FRONTEND_URL}/dashboard`
    );
  }
}

export default new EmailService();
