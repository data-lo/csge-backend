import { PartialType } from '@nestjs/mapped-types';
import { CreateImpresioneDto } from './create-impresione.dto';

export class UpdateImpresioneDto extends PartialType(CreateImpresioneDto) {}
