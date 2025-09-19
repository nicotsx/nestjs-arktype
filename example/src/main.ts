import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  app.enableCors();

  const options = new DocumentBuilder().setTitle('nestjs-arktype example').setVersion('1.0').build();

  const documentFactory = () => SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api/docs', app, documentFactory);

  await fs.promises.writeFile(path.join(__dirname, '../swagger.json'), JSON.stringify(documentFactory(), null, 2));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
