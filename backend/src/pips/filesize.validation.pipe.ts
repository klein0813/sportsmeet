import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    console.log('_metadata', _metadata);
    const oneKb = 1000;
    return value.size < oneKb;
  }
}
