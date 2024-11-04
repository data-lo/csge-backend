import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { EstacionService } from './estacion.service';
import { CreateEstacionDto } from './dto/create-estacion.dto';
import { UpdateEstacionDto } from './dto/update-estacion.dto';

@Controller('proveedores/estaciones')
export class EstacionController {
  constructor(
    private readonly estacionService: EstacionService)
  {}

  @Post()
  create(@Body() createEstacionDto: CreateEstacionDto) {
    return this.estacionService.create(createEstacionDto);
  }

  @Patch('desactivar')
  desactivarEstacion(@Body('estacionId',ParseUUIDPipe) estacionId:string){
    return this.estacionService.desactivarEstacion(estacionId);
  }

  @Patch('activar')
  activarEstacion(@Body('estacionId',ParseUUIDPipe) estacionId:string){
    return this.estacionService.activarEstacion(estacionId);
  }

  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.estacionService.findAll(+pagina);
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.estacionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateEstacionDto: UpdateEstacionDto) {
    return this.estacionService.update(id, updateEstacionDto);
  }
}
