import { Module } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from './entities/contrato.entity';
import { ContratoModificatorio } from '../contratos_modificatorios/entities/contratos_modificatorio.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contrato, ContratoModificatorio, Proveedor]),
    AuthModule,
    PassportModule
  ],
  controllers: [ContratosController],
  providers: [ContratosService],
  exports: [ContratosService],
})
export class ContratosModule {}
