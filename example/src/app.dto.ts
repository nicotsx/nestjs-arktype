import { type } from 'arktype';
import { createArkDto } from 'nestjs-arktype';

const subSub = type({
  force: 'number',
});

const sub = type({
  name: 'string',
  age: 'number',
  properties: subSub.array(),
});

export const createUserBody = type({
  email: 'string.email',
  id: 'number.integer = 10',
  optional: 'string?',
  versions: 'number[]',
  versions2: 'number[][]',
  sub: sub,
});

export class CreateUserBodyDto extends createArkDto(createUserBody, { name: 'CreateUserBodyDto', input: true }) {}
