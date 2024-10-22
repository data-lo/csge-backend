import { Module } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from './entities/contrato.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Contrato])],
  exports:[ContratosService],
  controllers: [ContratosController],
  providers: [ContratosService],
})
export class ContratosModule {}
