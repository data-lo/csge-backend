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
import { DocumentsModule } from 'src/documents/documents.module';

@Module({
  imports:[TypeOrmModule.forFeature([Orden]),
    CampañasModule,
    ProveedorModule,
    ContratosModule,
    PartidaModule,
    ServicioContratadoModule,
    DocumentsModule
  ],
  controllers: [OrdenController],
  providers: [OrdenService],
})
export class OrdenModule {}
