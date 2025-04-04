import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { CampañasService } from './campañas.service';
import { CreateCampañaDto } from './dto/create-campaña.dto';
import { UpdateCampañaDto } from './dto/update-campaña.dto';
import { CreateActivacionDto } from '../activacion/dto/create-activacion.dto';
import { CAMPAIGN_STATUS } from './interfaces/estatus-campaña.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CAMPAIGN_ROLES } from '../valid-modules-campanias-roles.ob';
import { SIGNATURE_ACTION_ENUM } from 'src/firma/firma/enums/signature-action-enum';

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
  @Post('send-to-signing-campaign/:campaignId')
  sendToSigningCampaign(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @Query('signatureAction') signatureAction: SIGNATURE_ACTION_ENUM
  ) {
    return this.campañasService.sendToSigningCampaign(campaignId, signatureAction);
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
  @Post('enable/:id')
  activar(@Param('id', ParseUUIDPipe) id: string, @Body() createActivacionDto: CreateActivacionDto) {
    return this.campañasService.createRenovation(id, createActivacionDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('pdf/:id')
  async getApprovalCampaignDocument(
    @Res() response: Response,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const pdfDoc = await this.campañasService.getCampaignDocument(id);

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
  @Get('close/:campaignId/:activationId')
  close(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @Param('activationId') activationId: string
  ) {
    return this.campañasService.closeCampaign(campaignId, activationId);
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
