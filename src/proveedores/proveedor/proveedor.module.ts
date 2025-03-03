import { Module } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';
import { Contrato } from 'src/contratos/contratos/entities/contrato.entity';
import { ProviderEventService } from './proveedor.events.service';

@Module({
  imports:[TypeOrmModule.forFeature([Proveedor, ContratoMaestro, Contrato]),
    AuthModule,
    PassportModule
  ],
  controllers: [ProveedorController],
  providers: [ProveedorService, ProviderEventService],
  exports:[ProveedorService, ProviderEventService]
})
export class ProveedorModule {}
