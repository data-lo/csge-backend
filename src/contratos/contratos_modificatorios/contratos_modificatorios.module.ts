import { Module } from '@nestjs/common';
import { ContratosModificatoriosService } from './contratos_modificatorios.service';
import { ContratosModificatoriosController } from './contratos_modificatorios.controller';

@Module({
  controllers: [ContratosModificatoriosController],
  providers: [ContratosModificatoriosService],
})
export class ContratosModificatoriosModule {}
