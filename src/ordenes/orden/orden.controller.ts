import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Res } from '@nestjs/common';
import { OrdenService } from './orden.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { EstatusOrdenDeServicio } from './interfaces/estatus-orden-de-servicio';
import { Response } from 'express';

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

  @Get('busqueda')
  findAllBusqueda() {
    return this.ordenService.findAllBusqueda();
  }

  @Get('pdf')
  async crearOrdenEnPdf(
    @Res() res:Response,
    @Param('id',ParseUUIDPipe) id:string
  ) {
    const pdfDoc = await this.ordenService.crearOrdenEnPdf(id);
    res.setHeader('Content-Type','application/pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  @Get('obtener-estatus/:id')
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
