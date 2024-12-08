import { Module } from '@nestjs/common';
import { ContratosModificatoriosService } from './contratos_modificatorios.service';
import { ContratosModificatoriosController } from './contratos_modificatorios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoModificatorio } from './entities/contratos_modificatorio.entity';
import { ContratosModule } from '../contratos/contratos.module';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContratoModificatorio]),
    ContratosModule,
    AuthModule,
    PassportModule,
  ],
  exports: [ContratosModificatoriosService],
  controllers: [ContratosModificatoriosController],
  providers: [ContratosModificatoriosService],
})
export class ContratosModificatoriosModule {}
