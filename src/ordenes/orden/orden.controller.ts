import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Res, ParseEnumPipe } from '@nestjs/common';
import { OrdenService } from './orden.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { ESTATUS_ORDEN_DE_SERVICIO } from './interfaces/estatus-orden-de-servicio';
import { Response } from 'express';
import { rolesOrdenes } from './valid-ordenes-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { LoggerService } from 'src/logger/logger.service';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { SIGNATURE_ACTION_ENUM } from 'src/firma/firma/enums/signature-action-enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { ValidPermises } from 'src/administracion/usuarios/interfaces/usuarios.permisos';


@Controller('ordenes/ordenes-de-servicio')
export class OrdenController {
  constructor(private readonly orderService: OrdenService) { }

  @Auth(...rolesOrdenes)
  @Post()
  create(@Body() createOrdenDto: CreateOrdenDto) {
    return this.orderService.create(createOrdenDto);
  }

  @Auth(...rolesOrdenes)
  @Post('send-to-signing-order/:orderId')
  sendToSigningCampaign(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Query('signatureAction') signatureAction: SIGNATURE_ACTION_ENUM
  ) {
    return this.orderService.sendToSigningOrder(orderId, signatureAction as SIGNATURE_ACTION_ENUM);
  }


  @Auth(...rolesOrdenes)
  @Get()
  findAll(@Query('pagina') pagina: string) {
    return this.orderService.findAll(+pagina);
  }

  @Auth(...rolesOrdenes)
  @Get('filters')
  getOrdersWithFilters(
    @GetUser() user: Usuario,
    @Query('pageParam') pageParam: number,
    @Query('searchParams') searchParams?: string,
    @Query('year') year?: string,
    @Query('status') status?: ESTATUS_ORDEN_DE_SERVICIO,
  ) {
    const canAccessHistory = user.permisos?.includes(ValidPermises.HISTORICO);
    return this.orderService.getOrdersWithFilters(pageParam, canAccessHistory, searchParams, year, status);
  }

  @Auth(...rolesOrdenes)
  @Get('rfc')
  findByRfc(
    @Query('rfc') rfc: string) {
    return this.orderService.findByRfc(rfc);
  }

  @Get('folios')
  obtenerFolios(
    @Query('servicio', new ParseEnumPipe(TIPO_DE_SERVICIO)) servicio: TIPO_DE_SERVICIO
  ) {
    return this.orderService.getCurrentFolio(servicio);
  }

  @Auth(...rolesOrdenes)
  @Get('busqueda')
  findAllBusqueda() {
    return this.orderService.findAllBusqueda();
  }

  @Auth(...rolesOrdenes)
  @Get('obtener-estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.obtenerEstatusOrden(id);
  }



  @Auth(...rolesOrdenes)
  @Get('pdf/:id')
  async obtenerOrdenEnPdf(
    @Res() res: Response,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const pdfDoc = await this.orderService.getOrderInPDF(id);

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
  @Get('pdf/campaign-orders/:id')
  async getCampaignOrdersInPDF(
    @Res() res: Response,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const pdfInUint8Array = await this.orderService.generateCampaignOrdersInPDF(id);
    const pdfBuffer = Buffer.from(pdfInUint8Array);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="orden_campaña_${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
      'is-blob-instance': 'true',
      'Access-Control-Expose-Headers': 'is-blob-instance'
    });

    return res.send(pdfBuffer);
  }


  @Auth(...rolesOrdenes)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.findOne(id);
  }

  @Auth(...rolesOrdenes)
  @Get('campanias/:campaignId')
  GetAllOrdersByCampaign(@Param('campaignId', ParseUUIDPipe) id: string) {
    return this.orderService.getActiveOrdersByCampaignAndActivation(id);
  }

  @Auth(...rolesOrdenes)
  @Patch('cancelar/:id')
  cancelarOrden(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.cancelarOrden(id);
  }

  @Auth(...rolesOrdenes)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateOrdenDto: UpdateOrdenDto) {
    return this.orderService.update(id, updateOrdenDto);
  }

  @Auth(...rolesOrdenes)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.remove(id);
  }
}
