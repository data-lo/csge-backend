import { PartialType } from '@nestjs/mapped-types';
import { CreateIvaDto } from './create-iva.dto';

export class UpdateIvaDto extends PartialType(CreateIvaDto) {}
