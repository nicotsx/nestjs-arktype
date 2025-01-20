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

    public transform(value: unknown, metadata: ArgumentMetadata) {
      if (this.dto) {
        return validate(value, this.dto.schema);
      }

      const { metatype } = metadata;

      if (!metatype) {
        return value;
      }

      if (!isArkDto(metatype)) {
        return value;
      }

      return validate(value, metatype.schema);
    }
  }

  return ArkValidationPipe;
}

export const ArkValidationPipe = createArkValidationPipe();
