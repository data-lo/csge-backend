import { Module } from '@nestjs/common';
import { CaracteristicasService } from './caracteristicas.service';
import { CaracteristicasController } from './caracteristicas.controller';

@Module({
  controllers: [CaracteristicasController],
  providers: [CaracteristicasService],
})
export class CaracteristicasModule {}
