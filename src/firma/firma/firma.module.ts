import { Module } from '@nestjs/common';
import { FirmaService } from './firma.service';
import { FirmaController } from './firma.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Firma } from './entities/firma.entity';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Firma,Usuario,Orden,Factura])],
  controllers: [FirmaController],
  providers: [FirmaService],
})
export class FirmaModule {}
