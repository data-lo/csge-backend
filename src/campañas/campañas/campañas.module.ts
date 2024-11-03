import { Module } from '@nestjs/common';
import { CampañasService } from './campañas.service';
import { CampañasController } from './campañas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaña } from './entities/campaña.entity';
import { DependenciaModule } from '../dependencia/dependencia.module';
import { Dependencia } from '../dependencia/entities/dependencia.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([Campaña, Dependencia]),
    DependenciaModule,
  ],
  controllers: [CampañasController],
  providers: [CampañasService],
})
export class CampañasModule {}
