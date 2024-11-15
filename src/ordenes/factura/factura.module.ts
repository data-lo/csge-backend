import { Module } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Orden } from '../orden/entities/orden.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Factura,Orden,Proveedor])],
  controllers: [FacturaController],
  providers: [FacturaService],
})
export class FacturaModule {}
