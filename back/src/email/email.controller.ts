import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { EmailService } from './email.service';

interface ContactBody {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  company?: unknown;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const requestsByIp = new Map<string, number[]>();

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function requestIp(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0];
  return first?.trim() || request.ip || 'unknown';
}

function assertRateLimit(ip: string): void {
  const now = Date.now();
  const recent = (requestsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    throw new HttpException(
      '잠시 후 다시 시도해 주세요.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
  recent.push(now);
  requestsByIp.set(ip, recent);
  if (requestsByIp.size > 1000) {
    for (const [key, timestamps] of requestsByIp) {
      if (!timestamps.some((timestamp) => now - timestamp < WINDOW_MS))
        requestsByIp.delete(key);
    }
  }
}

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async send(@Req() request: Request, @Body() body: ContactBody) {
    // 실제 사용자는 비워 두는 숨김 필드입니다. 봇에는 성공처럼 응답합니다.
    if (cleanText(body.company, 200)) return { success: true };

    assertRateLimit(requestIp(request));
    const name = cleanText(body.name, 80);
    const email = cleanText(body.email, 254).toLowerCase();
    const message = cleanText(body.message, 5000);
    if (!name || !email || !message) {
      throw new BadRequestException('모든 필드를 입력해주세요.');
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new BadRequestException('올바른 이메일 주소를 입력해 주세요.');
    }
    try {
      await this.emailService.sendContactMail(name, email, message);
      return { success: true };
    } catch {
      throw new InternalServerErrorException('메일 전송 실패');
    }
  }
}
