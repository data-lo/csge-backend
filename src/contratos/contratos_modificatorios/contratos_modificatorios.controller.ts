import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ContratosModificatoriosService } from './contratos_modificatorios.service';
import { CreateContratoModificatorioDto } from './dto/create-contratos_modificatorio.dto';
import { UpdateContratoModificatorioDto } from './dto/update-contratos_modificatorio.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CONTRACT_USER_ROLESModificatorios } from './valid-contratos-modificatorios-roles.ob';

@Controller('contratos/contratos-modificatorios')
export class ContratosModificatoriosController {
  constructor(private readonly contratosModificatoriosService: ContratosModificatoriosService) {}
  private readonly logger = new LoggerService(ContratosModificatoriosController.name);

  @Auth(...CONTRACT_USER_ROLESModificatorios)
  @Post()
  create(@Body() createContratosModificatorioDto: CreateContratoModificatorioDto) {
    return this.contratosModificatoriosService.create(createContratosModificatorioDto);
  }

  @Auth(...CONTRACT_USER_ROLESModificatorios)
  @Get()
  findAll(@Query('pagina') pagina:number) {
    return this.contratosModificatoriosService.findAll(pagina);
  }

  @Auth(...CONTRACT_USER_ROLESModificatorios)
  @Get('obtener-estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.getStatus(id);
  }

  @Auth(...CONTRACT_USER_ROLESModificatorios)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.findOne(id);
  }

  @Auth(...CONTRACT_USER_ROLESModificatorios)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratosModificatorioDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.update(id, updateContratosModificatorioDto);
  }

  @Auth(...CONTRACT_USER_ROLESModificatorios)
  @Patch('modificar-estatus/:id')
  modificarEstatus(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoModificatorioDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.modificarEstatus(id, updateContratoModificatorioDto);
  }

  @Auth(...CONTRACT_USER_ROLESModificatorios)
  @Patch('desactivar-cancelar/:id')
  desactivarCancelar(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.cancellContract(id, updateContratoDto);
  }

  @Auth(...CONTRACT_USER_ROLESModificatorios)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.remove(id);
  }
}
