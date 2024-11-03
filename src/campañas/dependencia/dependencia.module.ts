import { Module } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { DependenciaController } from './dependencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dependencia } from './entities/dependencia.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Dependencia])],
  exports:[DependenciaService],
  controllers: [DependenciaController],
  providers: [DependenciaService],
})
export class DependenciaModule {}
