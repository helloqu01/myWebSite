// src/lambda.ts
import { Handler, Context, APIGatewayProxyEvent, Callback } from 'aws-lambda';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as awsServerlessExpress from 'aws-serverless-express';
import { AppModule } from './app.module';

let server: Handler;

async function bootstrap() {
  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  nestApp.setGlobalPrefix('api');
  await nestApp.init();

  // aws-serverless-express로 래핑
  const awsServer = awsServerlessExpress.createServer(expressApp);
  server = (event: APIGatewayProxyEvent, ctx: Context, cb: Callback) =>
    awsServerlessExpress.proxy(awsServer, event, ctx, 'PROMISE').promise;
}

// 앱 초기화
bootstrap();

export const handler: Handler = (event, context, callback) => {
  if (!server) {
    return callback(new Error('Server not initialized'), undefined);
  }
  return server(event, context, callback);
};
