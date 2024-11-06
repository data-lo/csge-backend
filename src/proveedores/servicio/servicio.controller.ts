import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Controller('proveedores/servicios')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Post()
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.servicioService.create(createServicioDto);
  }

  @Patch('desactivar')
  desactivarServicio(@Body('servicioId',ParseUUIDPipe) servicioId:string){
    return this.servicioService.desactivarServicio(servicioId);
  }

  @Patch('activar')
  activarServicio(@Body('servicioId',ParseUUIDPipe) servicioId:string){
    return this.servicioService.desactivarServicio(servicioId);
  }

  @Patch('renovar')
  renovarServicio(){

  }

  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.servicioService.findAll(+pagina);
  }

  @Get('estatus/:id')
  obtenerEstatus(@Param('id',ParseUUIDPipe) id: string) {
    return this.servicioService.obtenerEstatus(id);
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.servicioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateServicioDto: UpdateServicioDto) {
    return this.servicioService.update(id, updateServicioDto);
  }

}
