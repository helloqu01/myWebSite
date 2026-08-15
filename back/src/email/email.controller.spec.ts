import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { EmailController } from './email.controller';
import type { EmailService } from './email.service';
import { escapeHtml } from './email.service';

describe('EmailController', () => {
  const sendContactMail = jest.fn().mockResolvedValue(undefined);
  const controller = new EmailController({
    sendContactMail,
  } as unknown as EmailService);
  const request = { headers: {}, ip: '127.0.0.1' } as unknown as Request;

  beforeEach(() => sendContactMail.mockClear());

  it('validates and normalizes a contact request', async () => {
    await expect(
      controller.send(request, {
        name: ' 홍길동 ',
        email: 'USER@EXAMPLE.COM',
        message: ' 문의 ',
      }),
    ).resolves.toEqual({ success: true });
    expect(sendContactMail).toHaveBeenCalledWith(
      '홍길동',
      'user@example.com',
      '문의',
    );
  });

  it('rejects an invalid email', async () => {
    await expect(
      controller.send(request, {
        name: '홍길동',
        email: 'invalid',
        message: '문의',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('silently accepts the honeypot without sending mail', async () => {
    await expect(controller.send(request, { company: 'bot' })).resolves.toEqual(
      { success: true },
    );
    expect(sendContactMail).not.toHaveBeenCalled();
  });
});

describe('escapeHtml', () => {
  it('escapes user-controlled markup', () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;',
    );
  });
});
