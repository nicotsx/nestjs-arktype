import { type ArgumentMetadata, BadRequestException, Injectable, type PipeTransform } from '@nestjs/common';
import { ArkErrors, type Type } from 'arktype';
import { type ArkDto, isArkDto } from './dto';

type ArkValidationPipeClass = new (dto?: ArkDto) => PipeTransform;

const validate = (value: unknown, schema: Type) => {
  const result = schema(value);

  if (result instanceof ArkErrors) {
    throw new BadRequestException(result.summary);
  }

  return result;
};

export function createArkValidationPipe(): ArkValidationPipeClass {
  @Injectable()
  class ArkValidationPipe implements PipeTransform {
    constructor(private dto?: ArkDto) {}

    public transform(value: unknown, { metatype }: ArgumentMetadata) {
      if (this.dto) {
        if (this.dto.isInput) {
          return validate(value, this.dto.input);
        }

        return validate(value, this.dto.output);
      }

      if (!metatype) {
        return value;
      }

      if (!isArkDto(metatype)) {
        return value;
      }

      if (metatype.isInput) {
        return validate(value, metatype.input);
      }

      return validate(value, metatype.output);
    }
  }

  return ArkValidationPipe;
}

export const ArkValidationPipe = createArkValidationPipe();
