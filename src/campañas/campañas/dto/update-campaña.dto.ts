import { PartialType } from '@nestjs/mapped-types';
import { CreateCampañaDto } from './create-campaña.dto';

export class UpdateCampañaDto extends PartialType(CreateCampañaDto) {}
