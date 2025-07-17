import { Controller, Post, Body, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post()
  async send(@Body() body: { name?: string; email?: string; message?: string }) {
    const { name, email, message } = body;
    if (!name || !email || !message) {
      throw new BadRequestException('모든 필드를 입력해주세요.');
    }
    try {
      await this.emailService.sendContactMail(name, email, message);
      return { success: true };
    } catch (err) {
      throw new InternalServerErrorException('메일 전송 실패');
    }
  }
}
