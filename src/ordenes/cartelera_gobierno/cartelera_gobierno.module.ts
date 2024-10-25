import { Module } from '@nestjs/common';
import { CarteleraGobiernoService } from './cartelera_gobierno.service';
import { CarteleraGobiernoController } from './cartelera_gobierno.controller';

@Module({
  controllers: [CarteleraGobiernoController],
  providers: [CarteleraGobiernoService],
})
export class CarteleraGobiernoModule {}
