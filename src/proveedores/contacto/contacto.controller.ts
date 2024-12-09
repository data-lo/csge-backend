import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Logger } from '@nestjs/common';
import { ContactoService } from './contacto.service';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { LoggerService } from 'src/logger/logger.service';
import { rolesContactos } from './valid-contacto-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('proveedores/contactos')
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}
  private readonly logger = new LoggerService(ContactoController.name);

  //@Auth(...rolesContactos)
  @Post()
  create(@Body() createContactoDto: CreateContactoDto) {
    return this.contactoService.create(createContactoDto);
  }

  //@Auth(...rolesContactos)
  @Get()
  findAll(@Query('pagina') pagina:string ) {
    return this.contactoService.findAll(+pagina);
  }

  //@Auth(...rolesContactos)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.contactoService.findOne(id);
  }

  //@Auth(...rolesContactos)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateContactoDto: UpdateContactoDto) {
    return this.contactoService.update(id, updateContactoDto);
  }

  //@Auth(...rolesContactos)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.contactoService.remove(id);
  }
}
