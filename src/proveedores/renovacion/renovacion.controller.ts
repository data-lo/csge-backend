import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { RenovacionService } from './renovacion.service';
import { CreateRenovacionDto } from './dto/create-renovacion.dto';
import { UpdateRenovacionDto } from './dto/update-renovacion.dto';
import { DesactivarRenovacionDto } from './dto/desactivar-renovacion.dto';

@Controller('proveedores/renovaciones')
export class RenovacionController {
  constructor(private readonly renovacionService: RenovacionService) {}

  @Post()
  create(@Body() createRenovacionDto: CreateRenovacionDto) {
    return this.renovacionService.create(createRenovacionDto);
  }

  @Patch('desactivar')
  desactivarRenovacion(@Body() desactivarRenovacionDto: DesactivarRenovacionDto) {
    return this.renovacionService.desactivarRenovacion(desactivarRenovacionDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.renovacionService.findAll(+pagina);
  }

  @Get('estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.renovacionService.obtenerEstatus(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.renovacionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateRenovacionDto: UpdateRenovacionDto) {
    return this.renovacionService.update(id, updateRenovacionDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.renovacionService.remove(id);
  }
}
