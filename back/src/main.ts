// back/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// dotenv 를 직접 불러오면 main.ts 에서도 process.env 를 바로 사용할 수 있습니다.
import { config as loadEnv } from 'dotenv';
loadEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // ➋ 프론트(예: http://localhost:3000)에서 호출할 수 있도록 CORS 허용
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT ? +process.env.PORT : 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
