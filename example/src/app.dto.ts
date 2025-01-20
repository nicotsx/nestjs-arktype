import { type } from 'arktype';
import { createArkDto } from 'nestjs-ark';

const userSchema = type({
  email: 'string.email = "hello@rico.com"',
  id: 'number.integer = 0',
  'versions?': '(number | string)[]',
  sub: type({
    name: 'string',
    age: 'number',
  }),
});

const sub = type({
  name: 'string',
  age: 'number',
});

export const createUserBody = type({
  email: 'string.email',
  id: 'number.integer = 0',
  optional: 'string?',
  'versions?': '(number | string)[]',
  arrayOfObjectLiteral: [
    {
      name: 'string',
    },
    '[]',
  ],
});

const simple = type({
  id: 'number',
  array: type({
    name: 'string',
    age: 'number',
  }).array(),
});

const arraySchema = simple.get('array');

export class UserDto extends createArkDto(userSchema, { name: 'UserDto' }) {}
export class CreateUserBodyDto extends createArkDto(createUserBody, { name: 'CreateUserBodyDto', input: false }) {}
