import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { CreateUserBodyDto } from './app.dto';

@Controller()
export class AppController {
  @Post('/user')
  @ApiBody({ type: CreateUserBodyDto })
  async createUser(@Body() body: CreateUserBodyDto): Promise<CreateUserBodyDto> {
    return body;
  }
}
