# NestJS ❤ ArkType

`nestjs-arktype` is a simple library to help you define and validate all your NestJS DTOs using ArkType

## Features

- Create your DTOs using ArkType and re-use them anywhere in your app
- Auto validation of your input body / params / query with `ArkValidationPipe`
- Generate a fully featured Openapi spec out of your DTOs

## Examples

```typescript
// user.dto.ts
import { type } from 'arktype';
import { createArkDto } from 'nestjs-arktype';

const userDto = type({
    id: 'number.integer',
    email: 'string.email',
    points: 'number',
    firstName: 'string',
    lastName: 'string',
});

const createUserBody = type({
    email: 'string.email',
    firstName: 'string',
    lastName: 'string',
});

export class CreateUserBodyDto extends createArkDto(createUserBody, { name: 'CreateUserBodyDto', input: true }) {}
export class UserDto extends createArkDto(userDto, { name: 'UserDto' }) {}

// user.controller.ts
@Post('/user')
@ApiBody({ type: CreateUserBodyDto })
async createUser(@Body() body: CreateUserBodyDto): Promise<UserDto> {
  const user = this.service.createUser(body);
  return UserDto.parse(user); // Validate your output against the schema if you need to
}
```

## Requirements

- `arktype` >= `2`
- `@nestjs/swagger` >= `11`
- Node.js 22.x or later.

NestJS doesn't support importing ESM only libraries. While we ship a CJS build,
ArkType 2 is now ESM only. Fortunately Node.js 22 lets you require() esm modules
out of the box so this is a hard requirement.

## Installation

```bash
npm install nestjs-arktype arktype @nestjs/swagger
```

## Usage

### Creating a DTO from an ArkType schema

```typescript
export class MyDto extends createArkDto(schema, { name: 'MyDto', input: true })
```

| Option | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `schema` | `Type` | **Required**. Any ArkType schema representing your DTO |
| `name` | `string` | **Required**. The name of your DTO |
| `input` | `boolean` | Whether the DTO should represent the input or your schema or the output (useful for example when defining a body DTO) |

## Validating your inputs

The validation pipe uses your ArkType schemas to parse and validate incoming data
from your parameter decorators. When the data is not valid it throws a
`BadRequestException` with a short summary of what went wrong.

To use it, in your main `app.module` add a new validation pipe.

```typescript
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ArkValidationPipe } from 'nestjs-arktype';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ArkValidationPipe,
    },
  ],
})
export class AppModule {}
```

Now whenever you use a parameter decorator in your controllers, it will be
automatically parsed through the ArkType schema if the DTO is an ArkTypeDto.

```typescript
async createUser(@Body() body: CreateUserBodyDto) {
  return body; // Body is parsed and validated with the ArkType schema 
}
```

## Acknowledgements

 - [nestjs-zod](https://github.com/BenLorantfy/nestjs-zod) - For inspiration and solutions
