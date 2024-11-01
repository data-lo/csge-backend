import { Module } from '@nestjs/common';
import { EstacionService } from './estacion.service';
import { EstacionController } from './estacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estacion } from './entities/estacion.entity';
import { MunicipioModule } from '../municipio/municipio.module';

@Module({
  controllers: [EstacionController],
  providers: [EstacionService],
  imports: [TypeOrmModule.forFeature([Estacion]),
    MunicipioModule
  ],
  exports:[
    EstacionService
  ]
})
export class EstacionModule {}
