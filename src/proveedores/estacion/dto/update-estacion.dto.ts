import { PartialType } from '@nestjs/mapped-types';
import { CreateEstacionDto } from './create-estacion.dto';

export class UpdateEstacionDto extends PartialType(CreateEstacionDto) {}
