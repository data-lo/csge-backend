import { PartialType } from '@nestjs/mapped-types';
import { CreateContratoModificatorioDto } from './create-contratos_modificatorio.dto';

export class UpdateContratoModificatorioDto extends PartialType(CreateContratoModificatorioDto) {}
