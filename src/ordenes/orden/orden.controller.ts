import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Res, ParseEnumPipe } from '@nestjs/common';
import { OrdenService } from './orden.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { EstatusOrdenDeServicio } from './interfaces/estatus-orden-de-servicio';
import { Response } from 'express';
import { rolesOrdenes } from './valid-ordenes-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { LoggerService } from 'src/logger/logger.service';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';


@Controller('ordenes/ordenes-de-servicio')
export class OrdenController {
  constructor(private readonly ordenService: OrdenService) { }
  private readonly logger = new LoggerService(OrdenController.name);

  @Auth(...rolesOrdenes)
  @Post()
  create(@Body() createOrdenDto: CreateOrdenDto) {
    return this.ordenService.create(createOrdenDto);
  }

  @Auth(...rolesOrdenes)
  @Post('mandar-aprobar/:id')
  aprobarOrdern(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordenService.mandarOrdenAFirmar(id);
  }

  @Auth(...rolesOrdenes)
  @Get()
  findAll(@Query('pagina') pagina: string) {
    return this.ordenService.findAll(+pagina);
  }

  @Auth(...rolesOrdenes)
  @Get('rfc')
  findByRfc(
    @Query('rfc') rfc: string) {
    return this.ordenService.findByRfc(rfc);
  }

  @Get('folios')
  obtenerFolios(
    @Query('servicio',new ParseEnumPipe(TIPO_DE_SERVICIO)) servicio:TIPO_DE_SERVICIO
  ){
    return this.ordenService.obtenerFolioDeOrden(servicio);
  }

  @Auth(...rolesOrdenes)
  @Get('busqueda')
  findAllBusqueda() {
    return this.ordenService.findAllBusqueda();
  }

  @Auth(...rolesOrdenes)
  @Get('obtener-estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenService.obtenerEstatusOrden(id);
  }

  @Auth(...rolesOrdenes)
  @Get('pdf/:id')
  async obtenerOrdenEnPdf(
    @Res() res: Response,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const pdfDoc = await this.ordenService.obtenerOrdenEnPdf(id);
    if (pdfDoc.tipo === 'url') {
      res.send(pdfDoc.url);
    }
    else {
      res.setHeader('Content-Type', 'application/pdf');
      pdfDoc.pipe(res);
      pdfDoc.end();
    }
  }

  @Auth(...rolesOrdenes)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenService.findOne(id);
  }

  @Auth(...rolesOrdenes)
  @Get('campanias/:campaignId')
  GetAllOrdersByCampaign(@Param('campaignId', ParseUUIDPipe) id: string) {
    return this.ordenService.obtenerOrdenesPorCampaniaId(id);
  }

  @Auth(...rolesOrdenes)
  @Patch('actualizar-estatus/:id')
  actualizarEstatus(@Param('id', ParseUUIDPipe) id: string, @Body('estatus') estatus: EstatusOrdenDeServicio) {
    return this.ordenService.actualizarEstatusOrden(id, estatus);
  }

  @Auth(...rolesOrdenes)
  @Patch('cancelar/:id')
  cancelarOrden(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenService.cancelarOrden(id);
  }

  @Auth(...rolesOrdenes)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrdenDto: UpdateOrdenDto) {
    return this.ordenService.update(id, updateOrdenDto);
  }

  @Auth(...rolesOrdenes)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordenService.remove(id);
  }



}
