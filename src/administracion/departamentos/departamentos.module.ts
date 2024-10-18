import { Module } from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { DepartamentosController } from './departamentos.controller';
import { TypeOrmModule} from '@nestjs/typeorm';
import { Departamento } from './entities/departamento.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Departamento])],
  exports:[TypeOrmModule,DepartamentosService],
  controllers: [DepartamentosController],
  providers: [DepartamentosService],
})
export class DepartamentosModule {}
