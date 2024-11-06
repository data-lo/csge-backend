import { Module } from '@nestjs/common';
import { CampañasService } from './campañas.service';
import { CampañasController } from './campañas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaña } from './entities/campaña.entity';
import { DependenciaModule } from '../dependencia/dependencia.module';
import { Dependencia } from '../dependencia/entities/dependencia.entity';
import { ActivacionModule } from '../activacion/activacion.module';
import { PartidaModule } from '../partida/partida.module';

@Module({
  imports:[
    TypeOrmModule.forFeature([Campaña, Dependencia]),
    DependenciaModule,
    ActivacionModule,
    PartidaModule
  ],
  controllers: [CampañasController],
  providers: [CampañasService],
})
export class CampañasModule {}
