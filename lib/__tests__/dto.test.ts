import { type } from 'arktype';
import { describe, expect, it } from 'vitest';
import { createArkDto } from '../dto';

describe('DTO', () => {
  it('should be able to create a DTO', () => {
    const sub = type({
      name: 'string',
      age: 'number',
    });

    const createUserBody = type({
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
      sub2: sub.array(),
    });

    class dto extends createArkDto(createUserBody, { name: 'MyDto' }) {}

    expect(dto.schema).toEqual(createUserBody);
  });
});
