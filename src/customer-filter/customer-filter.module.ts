import { Module } from '@nestjs/common';
import { CustomReportService } from './customer-filter.service';
import { CustomReportController } from './customer-filter.controller';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { Contrato } from 'src/contratos/contratos/entities/contrato.entity';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';
import { ContratoModificatorio } from 'src/contratos/contratos_modificatorios/entities/contratos_modificatorio.entity';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { Estacion } from 'src/proveedores/estacion/entities/estacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contrato,
      ContratoModificatorio,
      ContratoMaestro,
      Proveedor,
      Campaña,
      Factura,
      Orden,
      Estacion
    ]),
    AuthModule,
    PassportModule,
  ],
  controllers: [CustomReportController],
  providers: [CustomReportService],
})
export class CustomFilterModule { }

