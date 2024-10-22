import { PartialType } from '@nestjs/mapped-types';
import { CreateRenovacionDto } from './create-renovacion.dto';

export class UpdateRenovacionDto extends PartialType(CreateRenovacionDto) {}
