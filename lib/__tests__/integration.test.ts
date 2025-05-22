import 'reflect-metadata';

import { Body, Controller, type INestApplication, Module, Post } from '@nestjs/common';
import { ApiResponse, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { type } from 'arktype';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createArkDto } from '../dto';
import { ArkValidationPipe } from '../pipe';

const createUserBody = type({
  email: 'string.email',
  password: 'string',
  age: 'number = 18',
});

class CreateUserBodyDto extends createArkDto(createUserBody, { name: 'CreateUserBodyDto', input: true }) {}
class CreateUserBodyDtoOut extends createArkDto(createUserBody, { name: 'CreateUserBodyDtoOut' }) {}

@Controller()
class AppController {
  @Post('/user')
  @ApiResponse({ status: 201, type: CreateUserBodyDto })
  async createUser(@Body() body: CreateUserBodyDto): Promise<CreateUserBodyDto> {
    return CreateUserBodyDto.parse(body);
  }

  @Post('/user-out')
  @ApiResponse({ status: 201, type: CreateUserBodyDtoOut })
  async createUserOut(@Body() body: CreateUserBodyDtoOut): Promise<CreateUserBodyDtoOut> {
    return CreateUserBodyDtoOut.parse(body);
  }

  @Post('/user-in-out')
  @ApiResponse({ status: 201, type: CreateUserBodyDtoOut })
  async createUserInOut(@Body() body: CreateUserBodyDto): Promise<CreateUserBodyDtoOut> {
    return CreateUserBodyDtoOut.parse(body);
  }
}

@Module({
  controllers: [AppController],
})
class TestModule {}

describe('integration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ArkValidationPipe());
    await app.init();
  });

  it('should correctly create the openapi schema', async () => {
    const config = new DocumentBuilder().setTitle('Runtipi API').setDescription('API specs for Runtipi').setVersion('1.0').build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (_: string, methodKey: string) => methodKey,
    });

    expect(document).toMatchSnapshot();
  });

  it('should parse the incoming body', async () => {
    const email = 'hello@test.com';
    const password = '123456';

    return request(app.getHttpServer()).post('/user').send({ email, password }).expect(201).expect({
      email,
      password,
      age: 18,
    });
  });

  it('should throw an error if the body is invalid', async () => {
    const email = 'hello';
    const password = '123456';

    return request(app.getHttpServer()).post('/user').send({ email, password }).expect(400).expect({
      statusCode: 400,
      message: 'email must be an email address (was "hello")',
      error: 'Bad Request',
    });
  });

  it('should correctly validate against the output schema', async () => {
    const email = 'hello@hello.com';
    const password = '123456';

    return request(app.getHttpServer()).post('/user-out').send({ email, password }).expect(400).expect({
      error: 'Bad Request',
      message: 'age must be a number (was missing)',
      statusCode: 400,
    });
  });

  it('should correctly validate against the input and output schema', async () => {
    const email = 'hello@hello.com';
    const password = '123456';

    return request(app.getHttpServer()).post('/user-in-out').send({ email, password }).expect(201).expect({
      email,
      password,
      age: 18,
    });
  });
});
