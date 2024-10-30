import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { MunicipioService } from './municipio.service';
import { CreateMunicipioDto } from './dto/create-municipio.dto';
import { UpdateMunicipioDto } from './dto/update-municipio.dto';

@Controller('proveedores/municipios')

export class MunicipioController {
  constructor(private readonly municipioService: MunicipioService) {}

  @Post()
  create(@Body() createMunicipioDto: CreateMunicipioDto) {
    return this.municipioService.create(createMunicipioDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.municipioService.findAll(+pagina);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.municipioService.findOne(id);
  }

  @Get('es-frontera/:id')
  esFrontera(@Param('id', ParseUUIDPipe) id: string) {
    return this.municipioService.esFrontera(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateMunicipioDto: UpdateMunicipioDto) {
    return this.municipioService.update(id, updateMunicipioDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.municipioService.remove(id);
  }
}
