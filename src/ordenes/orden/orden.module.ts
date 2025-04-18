import { Module } from '@nestjs/common';
import { OrdenService } from './orden.service';
import { OrdenController } from './orden.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orden } from './entities/orden.entity';
import { CampañasModule } from 'src/campañas/campañas/campañas.module';
import { ProveedorModule } from 'src/proveedores/proveedor/proveedor.module';
import { ContratosModule } from 'src/contratos/contratos/contratos.module';
import { PartidaModule } from 'src/campañas/partida/partida.module';
import { ServicioContratadoModule } from '../servicio_contratado/servicio_contratado.module';
import { FirmaModule } from 'src/firma/firma/firma.module';
import { OrderEventsService } from './orden.events.service';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { IvaModule } from 'src/configuracion/iva/iva.module';
import { ActivacionModule } from 'src/campañas/activacion/activacion.module';

@Module({
  imports: [TypeOrmModule.forFeature([Orden]),
    CampañasModule,
    ProveedorModule,
    ContratosModule,
    PartidaModule,
    ServicioContratadoModule,
    FirmaModule,
    ActivacionModule,
    IvaModule,
    AuthModule,
    PassportModule
  ],
  controllers: [OrdenController],
  providers: [OrdenService, OrderEventsService],
})
export class OrdenModule { }