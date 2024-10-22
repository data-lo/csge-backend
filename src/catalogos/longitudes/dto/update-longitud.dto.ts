import { PartialType } from '@nestjs/mapped-types';
import { CreateLongitudDto } from './create-longitud.dto';

export class UpdateLongitudDto extends PartialType(CreateLongitudDto) {}
