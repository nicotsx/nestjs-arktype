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
  atLeastLength3: 'string.alphanumeric >= 3',
  lessThanLength10: 'string < 10',
  atMostLength5: 'string <= 5',
  nonEmptyAtMostLength10: '0 < string <= 10',
  integerStringWith2To5Digits: '2 <= string.integer < 6',
  positive: 'number > 0',
  atLeast3: 'number.integer >= 3',
  lessThanPi: 'number < 3.14159',
  atMost5: 'number <= 5',
  evenNumberAbsoluteValueLessThan50: '-50 < (number % 2) < 50',
  hello: 'boolean | number',
  boolean: 'boolean',
  hello2: sub.or(subSub),
});

export class CreateUserBodyDto extends createArkDto(createUserBody, { name: 'CreateUserBodyDto', input: true }) {}
