import { Module } from '@nestjs/common';
import { ServicioContratadoService } from './servicio_contratado.service';
import { ServicioContratadoController } from './servicio_contratado.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioContratado } from './entities/servicio_contratado.entity';
import { CarteleraGobierno } from '../cartelera_gobierno/entities/cartelera_gobierno.entity';
import { Orden } from '../orden/entities/orden.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicioContratado, CarteleraGobierno, Orden]),
    AuthModule,
    PassportModule,
  ],
  controllers: [ServicioContratadoController],
  providers: [ServicioContratadoService],
  exports: [ServicioContratadoService],
})
export class ServicioContratadoModule {}
