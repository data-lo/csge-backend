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

  @Post('desactivar')
  desactivarServicio(@Body('servicioId',ParseUUIDPipe) servicioId:string){
    return this.servicioService.desactivarServicio(servicioId);
  }

  @Post('renovar')
  renovarServicio(){

  }

  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.servicioService.findAll(+pagina);
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
