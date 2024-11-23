import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { LoggerService } from 'src/logger/logger.service';

@Controller('contratos/contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}
  private readonly logger = new LoggerService(ContratosController.name);

  @Post()
  create(@Body() createContratoDto: CreateContratoDto) {
    return this.contratosService.create(createContratoDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.contratosService.findAll(+pagina);
  }

  @Get('busqueda')
  findAllBusqueda() {
    return this.contratosService.findAllBusqueda();
  }

  @Get('obtener-estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosService.obtenerEstatus(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoDto) {
    return this.contratosService.update(id, updateContratoDto);
  }

  @Patch('modificar-estatus/:id')
  modificarEstatus(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoDto) {
    return this.contratosService.modificarEstatus(id, updateContratoDto);
  }

  @Patch('desactivar-cancelar/:id')
  desactivarCancelar(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoDto) {
    return this.contratosService.desactivarCancelarContrato(id, updateContratoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosService.remove(id);
  }
}
