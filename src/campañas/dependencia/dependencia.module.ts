import { Module } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { DependenciaController } from './dependencia.controller';

@Module({
  controllers: [DependenciaController],
  providers: [DependenciaService],
})
export class DependenciaModule {}
