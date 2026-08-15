// src/lambda.ts
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from 'aws-lambda';
import type { RequestListener } from 'http';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import serverlessExpress from '@vendia/serverless-express';
import { AppModule } from './app.module';

type AsyncServer = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

let server: AsyncServer | undefined;

async function bootstrap() {
  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  nestApp.setGlobalPrefix('api');
  nestApp.enableCors({
    origin: [process.env.ALLOWED_ORIGIN ?? 'https://codingbyohj.com'],
    methods: ['POST', 'OPTIONS'],
  });
  await nestApp.init();

  server = serverlessExpress({
    app: expressApp as RequestListener,
    resolutionMode: 'PROMISE',
  }) as unknown as AsyncServer;
}

const serverReady = bootstrap();

export const handler: Handler = async (event, context) => {
  await serverReady;
  if (!server) throw new Error('Server initialization failed');
  return await server(event as APIGatewayProxyEvent, context);
};
