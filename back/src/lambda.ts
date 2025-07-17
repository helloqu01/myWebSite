// src/lambda.ts
import { Handler, Context, APIGatewayProxyEvent, Callback } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import serverlessExpress from '@vendia/serverless-express';
import { AppModule } from './app.module';

let server: Handler;

async function bootstrap() {
  const app = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(app),
  );
  nestApp.setGlobalPrefix('api');
  await nestApp.init();
  server = serverlessExpress({ app });
}

bootstrap();

export const handler: Handler = (
  event: APIGatewayProxyEvent,
  ctx: Context,
  cb: Callback,
) => {
  if (!server) {
    return cb(new Error('Server not initialized'), undefined);
  }
  return server(event, ctx, cb);
};
