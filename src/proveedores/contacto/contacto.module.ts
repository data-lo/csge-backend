import { Module } from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { ContactoController } from './contacto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contacto } from './entities/contacto.entity';

@Module({
  controllers: [ContactoController],
  providers: [ContactoService],
  imports:[TypeOrmModule.forFeature([Contacto])],
  exports:[ContactoService]
})
export class ContactoModule {}
