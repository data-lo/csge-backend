import { Module } from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { ContactoController } from './contacto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contacto } from './entities/contacto.entity';
import { EstacionModule } from '../estacion/estacion.module';
import { ProveedorModule } from '../proveedor/proveedor.module';

@Module({
  controllers: [ContactoController],
  providers: [ContactoService],
  imports: [
    TypeOrmModule.forFeature([Contacto]),
    EstacionModule,
    ProveedorModule,
  ],
  exports: [ContactoService],
})
export class ContactoModule {}
