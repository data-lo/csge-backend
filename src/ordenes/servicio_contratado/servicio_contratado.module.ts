import { Module } from '@nestjs/common';
import { ServicioContratadoService } from './servicio_contratado.service';
import { ServicioContratadoController } from './servicio_contratado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioContratado } from './entities/servicio_contratado.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ServicioContratado])],
  controllers: [ServicioContratadoController],
  providers: [ServicioContratadoService],
})
export class ServicioContratadoModule {}
