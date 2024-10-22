import { Module } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from './entities/contrato.entity';
import { ContratosModificatoriosModule } from '../contratos_modificatorios/contratos_modificatorios.module';
import { ContratoModificatorio } from '../contratos_modificatorios/entities/contratos_modificatorio.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Contrato,ContratoModificatorio]),
    ContratosModificatoriosModule
  ],
  exports:[ContratosService],
  controllers: [ContratosController],
  providers: [ContratosService],
})
export class ContratosModule {}
