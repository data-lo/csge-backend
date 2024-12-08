import { Module } from '@nestjs/common';
import { CampañasService } from './campañas.service';
import { CampañasController } from './campañas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaña } from './entities/campaña.entity';
import { DependenciaModule } from '../dependencia/dependencia.module';
import { Dependencia } from '../dependencia/entities/dependencia.entity';
import { ActivacionModule } from '../activacion/activacion.module';
import { PartidaModule } from '../partida/partida.module';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaña, Dependencia]),
    DependenciaModule,
    ActivacionModule,
    PartidaModule,
    AuthModule,
    PassportModule,
  ],
  controllers: [CampañasController],
  providers: [CampañasService],
  exports: [CampañasService],
})
export class CampañasModule {}
