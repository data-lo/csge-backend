import { PartialType } from '@nestjs/mapped-types';
import { CreateRespFirmaDto } from './create-resp_firma.dto';

export class UpdateRespFirmaDto extends PartialType(CreateRespFirmaDto) {}
