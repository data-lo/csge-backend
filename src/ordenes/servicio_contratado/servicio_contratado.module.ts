import { Module } from '@nestjs/common';
import { ServicioContratadoService } from './servicio_contratado.service';
import { ServicioContratadoController } from './servicio_contratado.controller';

@Module({
  controllers: [ServicioContratadoController],
  providers: [ServicioContratadoService],
})
export class ServicioContratadoModule {}
