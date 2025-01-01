import { Module } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { FacturaController } from './factura.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Orden } from '../orden/entities/orden.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { FirmaModule } from 'src/firma/firma/firma.module';
import { FacturaEventosService } from './factura.events.service';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports:[TypeOrmModule.forFeature([Factura,Orden,Proveedor]),
  AuthModule,
  PassportModule,
  FirmaModule,
  MinioModule
],
  controllers: [FacturaController],
  providers: [FacturaService,FacturaEventosService],
})
export class FacturaModule {}
