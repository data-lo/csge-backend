import { Module } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { ServicioController } from './servicio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { Estacion } from '../estacion/entities/estacion.entity';
import { EstacionModule } from '../estacion/estacion.module';

@Module({
  controllers: [ServicioController],
  providers: [ServicioService],
  imports:[TypeOrmModule.forFeature([Servicio,Estacion]), 
  EstacionModule
  ],
  exports:[ServicioService]
})
export class ServicioModule {}
