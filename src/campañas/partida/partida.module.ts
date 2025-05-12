import { Module } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { PartidaController } from './partida.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partida } from './entities/partida.entity';
import { MatchEventsService } from './partida.events.service';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { Campaña } from '../campañas/entities/campaña.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { ContratosModule } from 'src/contratos/contratos/contratos.module';
import { FacturaModule } from 'src/ordenes/factura/factura.module';


@Module({
  controllers: [PartidaController],
  providers: [PartidaService, MatchEventsService],
  imports:
    [
      TypeOrmModule.forFeature([Partida, Campaña, Orden, Factura]),
      PassportModule,
      AuthModule,
      FacturaModule
    ],
    
  exports: [PartidaService]
})
export class PartidaModule { }
