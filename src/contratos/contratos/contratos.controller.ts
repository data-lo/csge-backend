import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe, Res } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { LoggerService } from 'src/logger/logger.service';
import { CONTRACT_USER_ROLES } from './valid-contratos-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ESTATUS_DE_CONTRATO } from '../interfaces/estatus-de-contrato';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { ValidPermises } from 'src/administracion/usuarios/interfaces/usuarios.permisos';

import { Response } from 'express';
import { CONTRACT_TYPE_REPORT_ENUM } from './reports/contract-type-report-enum';

@Controller('contratos/contratos')
export class ContratosController {
  constructor(private readonly contractService: ContratosService) { }
  private readonly logger = new LoggerService(ContratosController.name);

  @Auth(...CONTRACT_USER_ROLES)
  @Post()
  create(@Body() createContratoDto: CreateContratoDto) {
    this.logger.log('crear contrato')
    return this.contractService.create(createContratoDto);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get()
  findAll(@Query('pagina') pagina: string) {
    this.logger.log('obtener contratos')
    return this.contractService.findAll(+pagina);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get('busqueda')
  findAllBusqueda() {
    return this.contractService.findAllBusqueda();
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get('filters')
  getContractsWithFilters(
    @GetUser() user: Usuario,
    @Query('pageParam') pageParam: number,
    @Query('searchParams') searchParams?: string,
    @Query('year') year?: string,
    @Query('status') status?: ESTATUS_DE_CONTRATO,
  ) {
    const canAccessHistory = user.permisos?.includes(ValidPermises.HISTORICO);
    return this.contractService.getContractsWithFilters(pageParam, canAccessHistory, searchParams, year, status as ESTATUS_DE_CONTRATO);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get('obtener-estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractService.getContractStatus(id);
  }

  @Get("reports/excel/:type")
  async downloadExcel(@Param("type") type: CONTRACT_TYPE_REPORT_ENUM, @Res() res: Response) {
    return this.contractService.getReportInExcel(res, type);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get('tipos-de-servicios/:id')
  findTiposDeServicioPorProveedor(@Param('id', ParseUUIDPipe) proveedorId: string) {
    return this.contractService.getContractedServiceTypes(proveedorId);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractService.findOne(id);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoDto) {
    this.logger.log('Actualizar Contrato')
    return this.contractService.update(id, updateContratoDto);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Patch('modificar-estatus/:id')
  modificarEstatus(@Param('id', ParseUUIDPipe) id: string, @Body() newStatus: ESTATUS_DE_CONTRATO) {
    this.logger.log('Modificar Estatus del Contrato');
    return this.contractService.changeStatus(id, newStatus);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Patch('desactivar-cancelar/:id')
  desactivarCancelar(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoDto) {
    this.logger.log('Cancelar Contrato');
    return this.contractService.processContractCancellation(id, updateContratoDto);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(`Solicitud para eliminar contrato con ID: ${id}`);
    return this.contractService.remove(id);
  }
}
