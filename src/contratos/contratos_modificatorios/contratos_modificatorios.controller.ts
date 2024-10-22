import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ContratosModificatoriosService } from './contratos_modificatorios.service';
import { CreateContratoModificatorioDto } from './dto/create-contratos_modificatorio.dto';
import { UpdateContratoModificatorioDto } from './dto/update-contratos_modificatorio.dto';

@Controller('contratos/contratos-modificatorios')
export class ContratosModificatoriosController {
  constructor(private readonly contratosModificatoriosService: ContratosModificatoriosService) {}

  @Post()
  create(@Body() createContratosModificatorioDto: CreateContratoModificatorioDto) {
    return this.contratosModificatoriosService.create(createContratosModificatorioDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:number) {
    return this.contratosModificatoriosService.findAll(pagina);
  }

  @Get('obtener-estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.obtenerEstatus(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratosModificatorioDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.update(id, updateContratosModificatorioDto);
  }

  @Patch('modificar-estatus/:id')
  modificarEstatus(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoModificatorioDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.modificarEstatus(id, updateContratoModificatorioDto);
  }

  @Patch('desactivar-cancelar/:id')
  desactivarCancelar(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoModificatorioDto) {
    return this.contratosModificatoriosService.desactivarCancelarContrato(id, updateContratoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosModificatoriosService.remove(id);
  }
}
