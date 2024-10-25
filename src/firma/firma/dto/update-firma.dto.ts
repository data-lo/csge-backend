import { PartialType } from '@nestjs/mapped-types';
import { CreateFirmaDto } from './create-firma.dto';

export class UpdateFirmaDto extends PartialType(CreateFirmaDto) {}
