import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { LoggerService } from 'src/logger/logger.service';
import { CONTRACT_USER_ROLES } from './valid-contratos-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('contratos/contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) { }
  private readonly logger = new LoggerService(ContratosController.name);

  @Auth(...CONTRACT_USER_ROLES)
  @Post()
  create(@Body() createContratoDto: CreateContratoDto) {
    this.logger.log('crear contrato')
    return this.contratosService.create(createContratoDto);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get()
  findAll(@Query('pagina') pagina: string) {
    this.logger.log('obtener contratos')
    return this.contratosService.findAll(+pagina);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get('busqueda')
  findAllBusqueda() {
    return this.contratosService.findAllBusqueda();
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get('obtener-estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosService.obtenerEstatus(id);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get('tipos-de-servicios/:id')
  findTiposDeServicioPorProveedor(@Param('id', ParseUUIDPipe) proveedorId: string) {
    return this.contratosService.getContractedServiceTypes(proveedorId);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosService.findOne(id);
  }


  @Auth(...CONTRACT_USER_ROLES)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoDto) {
    this.logger.log('actualizar contrato')
    return this.contratosService.update(id, updateContratoDto);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Patch('modificar-estatus/:id')
  modificarEstatus(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoDto) {
    this.logger.log('modificar estatus de contrato');
    return this.contratosService.modificarEstatus(id, updateContratoDto);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Patch('desactivar-cancelar/:id')
  desactivarCancelar(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoDto) {
    this.logger.log('desactivar o cancelar contrato');
    return this.contratosService.desactivarCancelarContrato(id, updateContratoDto);
  }

  @Auth(...CONTRACT_USER_ROLES)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log('eliminar contrato');
    return this.contratosService.remove(id);
  }
}
