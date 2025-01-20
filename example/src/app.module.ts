import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ArkValidationPipe } from 'nestjs-arktype';
import { AppController } from './app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ArkValidationPipe,
    },
  ],
})
export class AppModule {}
