import { type } from 'arktype';
import { describe, expect, it } from 'vitest';
import { createArkDto } from '../dto';

describe('DTO', () => {
  it('should be able to create a DTO', () => {
    const sub = type({
      name: 'string',
      age: 'number',
    });

    const sub2 = type({
      hello: 'string = "hello"',
    });

    const createUserBody = type({
      versions: '(number)[]',
      versions2: '(number)[][]',
      sub: sub.or(sub2).array(),
    });

    class dto extends createArkDto(createUserBody, { name: 'MyDto' }) {}

    expect(dto.schema).toEqual(createUserBody);
  });
});
