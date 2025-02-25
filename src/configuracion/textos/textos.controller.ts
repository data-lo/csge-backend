import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { TextosService } from './textos.service';
import { CreateTextoDto } from './dto/create-texto.dto';
import { UpdateTextoDto } from './dto/update-texto.dto';
import { LoggerService } from 'src/logger/logger.service';
import { rolesTextos } from './valid-textos-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('configuracion/textos')
export class TextosController {
  constructor(private readonly textosService: TextosService) { }
  private readonly logger = new LoggerService(TextosController.name);

  @Auth(...rolesTextos)
  @Post()
  create(@Body() createTextoDto: CreateTextoDto) {
    return this.textosService.create(createTextoDto);
  }

  @Auth(...rolesTextos)
  @Get('encabezado')
  findEncabezado() {
    return this.textosService.obtenerEncabezado();
  }

  @Auth(...rolesTextos)
  @Get('pie-de-pagina')
  findPieDePagina() {
    return this.textosService.obtenerPieDePagina();
  }

  @Auth(...rolesTextos)
  @Get()
  findAll() {
    return this.textosService.findAll();
  }

  @Auth(...rolesTextos)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.textosService.findOne(id);
  }

  @Auth(...rolesTextos)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTextoDto: UpdateTextoDto) {
    return this.textosService.update(id, updateTextoDto);
  }

  @Auth(...rolesTextos)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.textosService.eliminarTexto(id);
  }
}
