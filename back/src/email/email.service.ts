// back/src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    const port = Number(this.config.get('SMTP_PORT') ?? 587);
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow<string>('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: {
        user: this.config.getOrThrow<string>('SMTP_USER'),
        pass: this.config.getOrThrow<string>('SMTP_PASS'),
      },
      tls: { minVersion: 'TLSv1.2' },
    });
  }

  async sendContactMail(
    name: string,
    email: string,
    message: string,
  ): Promise<void> {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br/>');
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
      <td style="padding: 8px;">${safeName}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold; background: #fafafa;">이메일</td>
      <td style="padding: 8px;">${safeEmail}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold; background: #f2f2f2; vertical-align: top;">메시지</td>
      <td style="padding: 8px;">${safeMessage}</td>
    </tr>
  </table>
  <p style="font-size: 0.9em; color: #777;">
    이 메일은 자동 발송된 메일입니다.
  </p>
</div>
    `;

    await this.transporter.sendMail({
      from: this.config.getOrThrow<string>('EMAIL_FROM'),
      to: this.config.getOrThrow<string>('EMAIL_TO'),
      replyTo: email,
      subject: `[웹사이트 문의] ${name.replace(/[\r\n]/g, ' ')}님`,
      text,
      html,
    });
  }
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character,
  );
}
