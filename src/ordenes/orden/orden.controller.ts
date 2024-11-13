import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { OrdenService } from './orden.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { EstatusOrdenDeServicio } from './interfaces/estatus-orden-de-servicio';

@Controller('ordenes/ordenes-de-servicio')
export class OrdenController {
  constructor(private readonly ordenService: OrdenService) {}

  @Post()
  create(@Body() createOrdenDto: CreateOrdenDto) {
    return this.ordenService.create(createOrdenDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:string ) {
    return this.ordenService.findAll(+pagina);
  }

  @Get('obtener-estatus:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenService.obtenerEstatusOrden(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenService.findOne(id);
  }

  @Patch('actualizar-estatus/:id')
  actualizarEstatus(@Param('id',ParseUUIDPipe) id: string, @Body('estatus') estatus: EstatusOrdenDeServicio) {
    return this.ordenService.actualizarEstatusOrden(id, estatus);
  }

  @Patch('cancelar/:id')
  cancelarOrden(@Param('id',ParseUUIDPipe) id: string) {
    return this.ordenService.cancelarOrden(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateOrdenDto: UpdateOrdenDto) {
    return this.ordenService.update(id, updateOrdenDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.ordenService.remove(id);
  }
}
