import { Module } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { ProveedorController } from './proveedor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { Contrato } from 'src/contratos/contratos/entities/contrato.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Proveedor, Contrato])],
  controllers: [ProveedorController],
  providers: [ProveedorService],
  exports:[ProveedorService]
})
export class ProveedorModule {}
