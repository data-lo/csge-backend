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
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { ValidPermises } from 'src/administracion/usuarios/interfaces/usuarios.permisos';
import { CAMPAIGN_TYPE_REPORT } from './reports/campaign-type-report-enum';

@Controller('campanias/campanias')
export class CampañasController {
  constructor(
    private readonly campaignService: CampañasService
  ) { }

  @Auth(...CAMPAIGN_ROLES)
  @Post()
  create(@Body() createCampañaDto: CreateCampañaDto) {
    return this.campaignService.create(createCampañaDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Post('send-to-signing-campaign/:campaignId')
  sendToSigningCampaign(
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
    @Query('signatureAction') signatureAction: SIGNATURE_ACTION_ENUM
  ) {
    return this.campaignService.sendToSigningCampaign(campaignId, signatureAction);
  }


  @Auth(...CAMPAIGN_ROLES)
  @Get()
  findAll(@Query('pagina') pagina: string) {
    return this.campaignService.findAll(+pagina);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('busqueda')
  findAllBusqueda() {
    return this.campaignService.findAllBusuqueda();
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('filters')
  getCampaignsWithFilters(
    @GetUser() user: Usuario,
    @Query('pageParam') pageParam: number,
    @Query('searchParams') searchParams?: string,
    @Query('year') year?: string,
    @Query('status') status?: CAMPAIGN_STATUS,
  ) {
    const canAccessHistory = user.permisos?.includes(ValidPermises.HISTORICO);
    return this.campaignService.getCampaignsWithFilters(pageParam, canAccessHistory, searchParams, year, status);
  }


  @Get("reports/excel/:type")
  async downloadExcel(@Param("type") type: CAMPAIGN_TYPE_REPORT, @Res() res: Response) {
    return this.campaignService.getReportInExcel(res, type);
  }

  
  @Auth(...CAMPAIGN_ROLES)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignService.findOne(id);
  }


  @Auth(...CAMPAIGN_ROLES)
  @Post('enable/:id')
  activar(@Param('id', ParseUUIDPipe) id: string, @Body() createActivacionDto: CreateActivacionDto) {
    return this.campaignService.createRenovation(id, createActivacionDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('pdf/:id')
  async getApprovalCampaignDocument(
    @Res() response: Response,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    const pdfDoc = await this.campaignService.getCampaignDocument(id);

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
    return this.campaignService.closeCampaign(campaignId, activationId);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCampañaDto: UpdateCampañaDto) {
    return this.campaignService.update(id, updateCampañaDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignService.remove(id);
  }
}
