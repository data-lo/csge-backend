import { PartialType } from '@nestjs/mapped-types';
import { CreateLongitudeDto } from './create-longitude.dto';

export class UpdateLongitudeDto extends PartialType(CreateLongitudeDto) {}
