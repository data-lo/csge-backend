import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ContratosModificatoriosService } from './contratos_modificatorios.service';
import { CreateContratoModificatorioDto } from './dto/create-contratos_modificatorio.dto';
import { UpdateContratoModificatorioDto } from './dto/update-contratos_modificatorio.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesContratosModificatorios } from './valid-contratos-modificatorios-roles.ob';

@Controller('contratos/contratos-modificatorios')
export class ContratosModificatoriosController {
  constructor(private readonly contratosModificatoriosService: ContratosModificatoriosService) {}
  private readonly logger = new LoggerService(ContratosModificatoriosController.name);

  //@Auth(...rolesContratosModificatorios)
  @Post()
  create(@Body() createContratosModificatorioDto: CreateContratoModificatorioDto) {
    return this.contratosModificatoriosService.create(createContratosModificatorioDto);
  }

  //@Auth(...rolesContratosModificatorios)
  @Get()
  findAll(@Query('pagina') pagina:number) {
    return this.contratosModificatoriosService.findAll(pagina);
  }

  //@Auth(...rolesContratosModificatorios)
  @Get('obtener-estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.obtenerEstatus(id);
  }

  //@Auth(...rolesContratosModificatorios)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.findOne(id);
  }

  //@Auth(...rolesContratosModificatorios)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratosModificatorioDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.update(id, updateContratosModificatorioDto);
  }

  //@Auth(...rolesContratosModificatorios)
  @Patch('modificar-estatus/:id')
  modificarEstatus(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoModificatorioDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.modificarEstatus(id, updateContratoModificatorioDto);
  }

  //@Auth(...rolesContratosModificatorios)
  @Patch('desactivar-cancelar/:id')
  desactivarCancelar(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.desactivarCancelarContrato(id, updateContratoDto);
  }

  //@Auth(...rolesContratosModificatorios)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.remove(id);
  }
}
