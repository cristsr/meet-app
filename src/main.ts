import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ENV } from 'environment';
import { listRoutes } from 'utils';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors();

  app.setGlobalPrefix('api');

  app.enableVersioning();

  app.useWebSocketAdapter(new WsAdapter(app));

  const showDocs: boolean = configService.get(ENV.SHOW_DOCS);

  if (showDocs) {
    const config = new DocumentBuilder()
      .setTitle('Meet app')
      .setDescription('Meet app API description')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document, { useGlobalPrefix: false });
  }

  const port = configService.get(ENV.PORT);

  await app.listen(port);

  listRoutes(app);

  Logger.log(`App running at port ${port}`, 'Bootstrap');
}
bootstrap();
