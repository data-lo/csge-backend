import { Module } from '@nestjs/common';
import { ActivacionService } from './activacion.service';
import { ActivacionController } from './activacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partida } from '../partida/entities/partida.entity';
import { Activacion } from './entities/activacion.entity';
import { Campaña } from '../campañas/entities/campaña.entity';
import { ActivacionEventosService } from './activacion.events.service';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { ServicioContratado } from 'src/ordenes/servicio_contratado/entities/servicio_contratado.entity';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';

@Module({
  controllers: [ActivacionController],
  providers: [ActivacionService, ActivacionEventosService],
  imports: [TypeOrmModule.forFeature([Partida, Activacion, Campaña, Orden, ServicioContratado, ContratoMaestro]),
  AuthModule,
  PassportModule,
  ],
  exports: [ActivacionService],
})
export class ActivacionModule {}
