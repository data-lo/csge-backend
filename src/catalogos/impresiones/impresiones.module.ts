import { Module } from '@nestjs/common';
import { ImpresionesService } from './impresiones.service';
import { ImpresionesController } from './impresiones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Impresion } from './entities/impresion.entity';
import { DimensionesModule } from '../dimensiones/dimensiones.module';
import { AuthModule } from 'src/auth/auth.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports:[
    TypeOrmModule.forFeature([Impresion]),
    DimensionesModule,
    AuthModule,
    PassportModule  
  ],
  exports:[ImpresionesService],
  controllers: [ImpresionesController],
  providers: [ImpresionesService],
})
export class ImpresionesModule {}
