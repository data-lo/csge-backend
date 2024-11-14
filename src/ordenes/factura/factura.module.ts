import { Module } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Factura,Proveedor,Usuario])],
  controllers: [FacturaController],
  providers: [FacturaService],
})
export class FacturaModule {}
