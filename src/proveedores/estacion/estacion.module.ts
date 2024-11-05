import { Module } from '@nestjs/common';
import { EstacionService } from './estacion.service';
import { EstacionController } from './estacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estacion } from './entities/estacion.entity';
import { MunicipioModule } from '../municipio/municipio.module';
import { Proveedor } from '../proveedor/entities/proveedor.entity';

@Module({
  controllers: [EstacionController],
  providers: [EstacionService],
  imports: [TypeOrmModule.forFeature([Estacion,Proveedor]),
    MunicipioModule
  ],
  exports:[
    EstacionService
  ]
})
export class EstacionModule {}
