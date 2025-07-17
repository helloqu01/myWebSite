// back/src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT'),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendContactMail(name: string, email: string, message: string) {
    const text = `
새로운 문의가 도착했습니다.

이름: ${name}
이메일: ${email}

메시지:
${message}
    `;

    const html = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
  <h2 style="color: #0073e6; margin-bottom: 20px;">📬 새로운 문의가 도착했습니다</h2>
  <table style="width:100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="padding: 8px; font-weight: bold; background: #f2f2f2; width: 100px;">이름</td>
      <td style="padding: 8px;">${name}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold; background: #fafafa;">이메일</td>
      <td style="padding: 8px;">${email}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold; background: #f2f2f2; vertical-align: top;">메시지</td>
      <td style="padding: 8px;">${message.replace(/\n/g, '<br/>')}</td>
    </tr>
  </table>
  <p style="font-size: 0.9em; color: #777;">
    이 메일은 자동 발송된 메일입니다.
  </p>
</div>
    `;

    return this.transporter.sendMail({
      from: this.config.get('EMAIL_FROM'),
      to:   this.config.get('EMAIL_TO'),
      subject: `[웹사이트 문의] ${name}님`,
      text,
      html,
    });
  }
}
