import { Module } from '@nestjs/common';
import { PuestosService } from './puestos.service';
import { PuestosController } from './puestos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Puesto } from './entities/puesto.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Puesto])],
  exports:[TypeOrmModule],
  controllers: [PuestosController],
  providers: [PuestosService],
})
export class PuestosModule {}
