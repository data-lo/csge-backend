import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { CampañasService } from './campañas.service';
import { CreateCampañaDto } from './dto/create-campaña.dto';
import { UpdateCampañaDto } from './dto/update-campaña.dto';
import { CreateActivacionDto } from '../activacion/dto/create-activacion.dto';
import { CAMPAIGN_STATUS } from './interfaces/estatus-campaña.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CAMPAIGN_ROLES } from '../valid-modules-campanias-roles.ob';

@Controller('campanias/campanias')
export class CampañasController {
  constructor(
    private readonly campañasService: CampañasService
  ) { }

  @Auth(...CAMPAIGN_ROLES)
  @Post()
  create(@Body() createCampañaDto: CreateCampañaDto) {
    return this.campañasService.create(createCampañaDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Post('mandar-aprobar/:id')
  aprobarCampania(
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.campañasService.mandarCampañaAAprobar(id);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get()
  findAll(@Query('pagina') pagina: string) {
    return this.campañasService.findAll(+pagina);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('busqueda')
  findAllBusqueda() {
    return this.campañasService.findAllBusuqueda();
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campañasService.findOne(id);
  }


  @Auth(...CAMPAIGN_ROLES)
  @Patch('activar/:id')
  activar(@Param('id', ParseUUIDPipe) id: string, @Body() createActivacionDto: CreateActivacionDto) {
    return this.campañasService.createRenovation(id, createActivacionDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('pdf/:id')
  async getApprovalCampaignDocument(
    @Res() response: Response,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const pdfDoc = await this.campañasService.getApprovalCampaignDocument(id);

    if (pdfDoc.tipo === 'url') {
      response.send(pdfDoc.url);
    }

    else {
      response.setHeader('Content-Type', 'application/pdf');
      pdfDoc.pipe(response);
      pdfDoc.end();
    }
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('close/:id')
  close(@Param('id', ParseUUIDPipe) id: string) {
    return this.campañasService.closeCampaign(id);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Patch('cancelar')
  cancelar(@Body('campañaId', ParseUUIDPipe) id: string) {
    return this.campañasService.cancelarCampaña(id);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCampañaDto: UpdateCampañaDto) {
    return this.campañasService.update(id, updateCampañaDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.campañasService.remove(id);
  }
}
