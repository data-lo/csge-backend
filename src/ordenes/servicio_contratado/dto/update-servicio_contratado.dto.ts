import { PartialType } from '@nestjs/mapped-types';
import { CreateContractedServiceDto } from './create-servicio_contratado.dto';

export class UpdateServicioContratadoDto extends PartialType(CreateContractedServiceDto) {}
