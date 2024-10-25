import { PartialType } from '@nestjs/mapped-types';
import { CreateCarteleraGobiernoDto } from './create-cartelera_gobierno.dto';

export class UpdateCarteleraGobiernoDto extends PartialType(CreateCarteleraGobiernoDto) {}
