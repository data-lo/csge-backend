import { Module } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Orden } from '../orden/entities/orden.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { DocumentsModule } from 'src/documents/documents.module';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[TypeOrmModule.forFeature([Factura,Orden,Proveedor]),
  DocumentsModule,
  AuthModule,
  PassportModule
],
  controllers: [FacturaController],
  providers: [FacturaService],
})
export class FacturaModule {}
