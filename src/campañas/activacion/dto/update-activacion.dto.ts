import { PartialType } from '@nestjs/mapped-types';
import { CreateActivacionDto } from './create-activacion.dto';

export class UpdateActivacionDto extends PartialType(CreateActivacionDto) {}
