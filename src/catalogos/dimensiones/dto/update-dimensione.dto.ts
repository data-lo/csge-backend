import { PartialType } from '@nestjs/mapped-types';
import { CreateDimensioneDto } from './create-dimensione.dto';

export class UpdateDimensioneDto extends PartialType(CreateDimensioneDto) {}
