import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';
import { ContratosModule } from 'src/contratos/contratos/contratos.module'; // Importa el módulo
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { Servicio } from 'src/proveedores/servicio/entities/servicio.entity';
import { ServicioModule } from 'src/proveedores/servicio/servicio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContratoMaestro, Proveedor, Servicio]),
    ContratosModule,
    ServicioModule
  ],
  providers: [EventsService],
  exports: [EventsService], 
})
export class EventsModule {}
