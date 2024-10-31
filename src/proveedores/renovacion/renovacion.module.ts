import { Module } from '@nestjs/common';
import { RenovacionService } from './renovacion.service';
import { RenovacionController } from './renovacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Renovacion } from './entities/renovacion.entity';
import { IvaModule } from 'src/configuracion/iva/iva.module';
import { Servicio } from '../servicio/entities/servicio.entity';


@Module({
  controllers: [RenovacionController],
  providers: [RenovacionService],
  imports: [
    TypeOrmModule.forFeature([Renovacion,Servicio]),
    IvaModule,
  ],
  exports:[RenovacionService]
})
export class RenovacionModule {}
