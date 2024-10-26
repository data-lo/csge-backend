import { PartialType } from '@nestjs/mapped-types';
import { CreateImpresionDto } from './create-impresion.dto';

export class UpdateImpresionDto extends PartialType(CreateImpresionDto) {}
