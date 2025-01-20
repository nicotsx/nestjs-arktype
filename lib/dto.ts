import { InternalServerErrorException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ArkErrors, type Type } from 'arktype';

type PrimitiveSwaggerType = 'string' | 'null' | 'number' | 'boolean' | 'integer' | 'object' | 'array';

type Options = {
  name: string;
  input?: boolean;
};

type JsonSchema = { properties: Record<string, unknown>; required: string[] };
type JsonField = { type: PrimitiveSwaggerType; items: { anyOf?: SchemaObject[]; type?: 'object' }; pattern: string };

export interface ArkDto<T extends Type<unknown> = Type<unknown>> {
  new (): T['inferOut'];
  isArkDto: true;
  schema: T;
  create(input: unknown): T['inferOut'];
  parse(data: T['inferIn']): T['inferOut'];
  parseUnknown(data: unknown): T['inferOut'];
  input: Type<T['inferIn']>;
  output: Type<T['inferOut']>;
}

export function createArkDto<T extends Type>(schema: T, opts: Options) {
  const { name, input = false } = opts;

  class AugmentedArkDto {
    public static schema = schema;
    public static input = schema.in;
    public static output = schema.out;
    public static isArkDto = true;

    constructor(schema: T) {
      AugmentedArkDto.schema = schema;
      AugmentedArkDto.input = schema.in;
      AugmentedArkDto.output = schema.out;
    }

    static parse(data: T['inferIn']): T['inferOut'] {
      const result = schema(data);

      if (result instanceof ArkErrors) {
        throw new InternalServerErrorException(result.summary);
      }

      return result;
    }

    static parseUnknown(data: unknown): T['inferOut'] {
      const result = schema(data);

      if (result instanceof ArkErrors) {
        throw new InternalServerErrorException(result.summary);
      }

      return result;
    }
  }

  // @ts-ignore - We know this is a json schema thanks to the jsonSchema type
  const jsonSchema = (input ? schema.toJsonSchema() : schema.out.toJsonSchema()) as JsonSchema;

  Object.defineProperty(AugmentedArkDto, 'name', { value: name });

  const keys = Object.keys(jsonSchema.properties);
  const requiredFields = jsonSchema.required || [];

  for (const key of keys) {
    const field = jsonSchema.properties[key] as JsonField;

    if (!field) {
      continue;
    }

    Object.defineProperty(AugmentedArkDto.prototype, key, {
      value: undefined,
      enumerable: true,
    });

    const isRequired = requiredFields.includes(key);

    if (field.type === 'object') {
      // @ts-ignore - We know this is an object type thanks to the check above
      const subSchema = schema.get(key);

      const NestedClass = createArkDto(subSchema, { name: `${name}${key[0]?.toUpperCase()}${key.slice(1)}`, input });

      ApiProperty({ type: () => NestedClass, required: isRequired })(AugmentedArkDto.prototype, key);
      continue;
    }

    if (field.type === 'array' && field.items.type === 'object') {
      continue;
      console.log('Trying to extract', key, 'from');
      // @ts-ignore - We know this is an object type thanks to the check above
      const subSchema = schema.get(key).get(0);

      // @ts-ignore - We know this is an object type thanks to the check above
      // console.log(newT);

      // console.log(subSchema);

      const NestedClass = createArkDto(subSchema, { name: `${name}${key[0]?.toUpperCase()}${key.slice(1)}`, input });

      ApiProperty({ type: () => [NestedClass], required: isRequired })(AugmentedArkDto.prototype, key);
      continue;
    }
    if (field.type === 'array') {
      ApiProperty({ type: field.type, anyOf: field.items.anyOf, required: isRequired, pattern: field.pattern })(AugmentedArkDto.prototype, key);
      continue;
    }

    ApiProperty({ type: field.type, required: isRequired, pattern: field.pattern })(AugmentedArkDto.prototype, key);
  }

  return AugmentedArkDto as unknown as ArkDto<T>;
}

export function isArkDto(metatype: unknown): metatype is ArkDto {
  // biome-ignore lint/suspicious/noExplicitAny: need to check for isArkDto
  return (metatype as any)?.isArkDto;
}
