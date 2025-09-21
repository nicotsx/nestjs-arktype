import { InternalServerErrorException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArkErrors, type Type } from 'arktype';
import { pruneEmptyAnyOfInPlace } from './utils/clean';

type Options = {
  name: string;
  input?: boolean;
};

type PrimitiveSwaggerType = 'string' | 'null' | 'number' | 'boolean' | 'integer';
type JsonSchema = { type: 'object'; properties: Record<string, JsonField>; required: string[] };
type JsonField =
  | {
      type: PrimitiveSwaggerType;
      anyOf?: never;
      const?: never;
      enum?: string[];
    }
  | {
      type: 'array';
      items: JsonField;
      anyOf?: never;
      const?: never;
    }
  | {
      type: 'object';
      properties: Record<string, JsonField>;
      required: string[];
      anyOf?: never;
      const?: never;
    }
  | {
      type?: never;
      anyOf: JsonField[];
      required?: never;
      const?: never;
    }
  | {
      const: string;
      type?: never;
      anyOf?: never;
    };

export interface ArkDto<T extends Type<unknown> = Type<unknown>> {
  new (): T['inferOut'];
  isArkDto: true;
  schema: T;
  parse(data: T['inferIn']): T['inferOut'];
  parseUnknown(data: unknown): T['inferOut'];
  input: Type<T['inferIn']>;
  output: Type<T['inferOut']>;
}

const applyApiProperties = (jsonSchema: JsonSchema, target: ArkDto) => {
  pruneEmptyAnyOfInPlace(jsonSchema);

  const { properties = {}, required = [] } = jsonSchema;

  for (let [key, value] of Object.entries(properties)) {
    Object.defineProperty(target.prototype, key, {
      value: undefined,
      enumerable: true,
      writable: true,
    });

    const isRequired = required.includes(key);

    if (value.anyOf?.[0]?.const) {
      value = { type: 'string', enum: value.anyOf.map((v) => v.const).filter((v) => v !== undefined) };
    }

    const Decorator = isRequired ? ApiProperty : ApiPropertyOptional;

    if (value.type === 'object' && value.properties) {
      Decorator({ selfRequired: isRequired, ...value })(target.prototype, key);
    } else {
      Decorator({ type: 'string', ...value })(target.prototype, key);
    }
  }
};

type ParseOptions = {
  reportOnly?: boolean;
};

export function createArkDto<T extends Type>(schema: T, opts: Options) {
  const { name, input = false } = opts;

  class AugmentedArkDto {
    public static schema = schema;
    public static input = schema.in;
    public static output = schema.out;
    public static isArkDto = true;

    static parse(data: T['inferIn'], opts: ParseOptions = {}): T['inferOut'] {
      const result = schema(data);

      if (result instanceof ArkErrors) {
        if (opts.reportOnly) {
          console.error(result.summary);
          return result as unknown as T['inferOut'];
        }

        throw new InternalServerErrorException(result.summary);
      }

      return result;
    }

    static parseUnknown(data: unknown, opts: ParseOptions = {}): T['inferOut'] {
      const result = schema(data);

      if (result instanceof ArkErrors) {
        if (opts.reportOnly) {
          console.error(result.summary);
          return result as unknown as T['inferOut'];
        }
        throw new InternalServerErrorException(result.summary);
      }

      return result;
    }
  }

  Object.defineProperty(AugmentedArkDto, 'name', { value: name });

  const jsonSchema = input
    ? schema.in.toJsonSchema({
        fallback: { default: (ctx) => ctx.base },
      })
    : schema.out.toJsonSchema({
        fallback: { default: (ctx) => ctx.base },
      });

  applyApiProperties(jsonSchema as JsonSchema, AugmentedArkDto as unknown as ArkDto<T>);

  return AugmentedArkDto as unknown as ArkDto<T>;
}

export function isArkDto(metatype: unknown): metatype is ArkDto {
  // biome-ignore lint/suspicious/noExplicitAny: needed to check for isArkDto
  return (metatype as any)?.isArkDto;
}
