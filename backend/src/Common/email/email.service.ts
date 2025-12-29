import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  /**
   * Send email notification
   */
  async send(options: EmailTemplate): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_USER'),
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      // In production, you might want to queue failed emails for retry
    }
  }

  /**
   * Email Templates */

  async sendLeaveRequestNotification(
    managerEmail: string,
    employeeName: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    requestId: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Leave Request Pending Approval</h2>
        <p>Dear Manager,</p>
        <p><strong>${employeeName}</strong> has submitted a leave request that requires your approval.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>From:</strong> ${fromDate}</p>
          <p><strong>To:</strong> ${toDate}</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
        </div>
        
        <p>Please review and take action at your earliest convenience.</p>
        <a href="${this.configService.get('FRONTEND_URL')}/leaves/approvals" 
           style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
          Review Request
        </a>
        
        <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
          This is an automated message from the HR Management System.
        </p>
      </div>
    `;

    await this.send({
      to: managerEmail,
      subject: `Leave Request from ${employeeName}`,
      html,
    });
  }

  async sendLeaveApprovedNotification(
    employeeEmail: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Leave Request Approved ✓</h2>
        <p>Good news! Your leave request has been approved.</p>
        
        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>From:</strong> ${fromDate}</p>
          <p><strong>To:</strong> ${toDate}</p>
        </div>
        
        <p>Have a great time off!</p>
        
        <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
          This is an automated message from the HR Management System.
        </p>
      </div>
    `;

    await this.send({
      to: employeeEmail,
      subject: 'Leave Request Approved',
      html,
    });
  }

  async sendLeaveRejectedNotification(
    employeeEmail: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    reason: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Leave Request Not Approved</h2>
        <p>Unfortunately, your leave request has not been approved.</p>
        
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>From:</strong> ${fromDate}</p>
          <p><strong>To:</strong> ${toDate}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        </div>
        
        <p>Please contact your manager for more information.</p>
        
        <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
          This is an automated message from the HR Management System.
        </p>
      </div>
    `;

    await this.send({
      to: employeeEmail,
      subject: 'Leave Request Status Update',
      html,
    });
  }

  async sendEscalationNotification(
    hrEmail: string,
    managerEmail: string,
    employeeName: string,
    leaveType: string,
    requestId: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Leave Request Auto-Escalated ⚠️</h2>
        <p>A leave request has been automatically escalated due to no manager action within 48 hours.</p>
        
        <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Employee:</strong> ${employeeName}</p>
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Manager:</strong> ${managerEmail}</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
        </div>
        
        <p>Please review this request urgently.</p>
        <a href="${this.configService.get('FRONTEND_URL')}/leaves/approvals" 
           style="background-color: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
          Review Now
        </a>
        
        <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
          This is an automated escalation from the HR Management System.
        </p>
      </div>
    `;

    await this.send({
      to: hrEmail,
      subject: `ESCALATED: Leave Request from ${employeeName}`,
      html,
    });
  }

  async sendDelegationNotification(
    delegateEmail: string,
    employeeName: string,
    leaveType: string,
    fromDate: string,
    toDate: string,
    requestId: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Leave Request Delegated to You</h2>
        <p>Dear Manager,</p>
        <p>A leave request has been delegated to you for approval.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Employee:</strong> ${employeeName}</p>
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>From:</strong> ${fromDate}</p>
          <p><strong>To:</strong> ${toDate}</p>
          <p><strong>Request ID:</strong> ${requestId}</p>
        </div>
        
        <p>Please review and take action at your earliest convenience.</p>
        <a href="${this.configService.get('FRONTEND_URL')}/leaves/approvals" 
           style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">
          Review Request
        </a>
        
        <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
          This is an automated delegation notification from the HR Management System.
        </p>
      </div>
    `;

    await this.send({
      to: delegateEmail,
      subject: `Delegated Leave Request from ${employeeName}`,
      html,
    });
  }
}
