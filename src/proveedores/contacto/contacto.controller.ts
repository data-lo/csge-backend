import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Logger } from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { LoggerService } from 'src/logger/logger.service';

@Controller('proveedores/contactos')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}
  private readonly logger = new LoggerService(ContactoController.name);

  @Post()
  create(@Body() createContactoDto: CreateContactoDto) {
    return this.contactoService.create(createContactoDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:string ) {
    return this.contactoService.findAll(+pagina);
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.contactoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateContactoDto: UpdateContactoDto) {
    return this.contactoService.update(id, updateContactoDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.contactoService.remove(id);
  }
}
