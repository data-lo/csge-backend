import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ParseEnumPipe } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ProveedorParcialDto } from './dto/proveedor-parcial.dto';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { LoggerService } from 'src/logger/logger.service';
import { rolesProveedores } from './valid-proveedores-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('proveedores/proveedores')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) { }
  private readonly logger = new LoggerService(ProveedorController.name);

  @Auth(...rolesProveedores)
  @Post()
  create(@Body() createProveedorDto: CreateProveedorDto | ProveedorParcialDto) {
    return this.proveedorService.create(createProveedorDto);
  }

  @Auth(...rolesProveedores)
  @Patch('desactivar')
  desactivarProveedor(@Body('proveedorId', ParseUUIDPipe) proveedorId: string) {
    return this.proveedorService.desactivateProvider(proveedorId);
  }

  @Auth(...rolesProveedores)
  @Patch('activar')
  activarProveedor(@Body('proveedorId', ParseUUIDPipe) proveedorId: string) {
    return this.proveedorService.activateProvider(proveedorId);
  }

  @Auth(...rolesProveedores)
  @Get()
  findAll(@Query('pagina') pagina: string) {
    return this.proveedorService.findAll(+pagina);
  }

  @Auth(...rolesProveedores)
  @Get('contratos/:id')
  obtenerTIPO_DE_CONTRATO(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('TIPO_DE_SERVICIO', new ParseEnumPipe(TIPO_DE_SERVICIO)) TIPO_DE_SERVICIO: TIPO_DE_SERVICIO) {
    return this.proveedorService.obtenerContartoDelProveedor(id, TIPO_DE_SERVICIO);
  }

  @Auth(...rolesProveedores)
  @Get('servicios')
  findManyByServices(
    @Query('TIPO_DE_SERVICIO', new ParseEnumPipe(TIPO_DE_SERVICIO)) TIPO_DE_SERVICIO: TIPO_DE_SERVICIO) {
    return this.proveedorService.findByService(TIPO_DE_SERVICIO);
  }

  @Auth(...rolesProveedores)
  @Get('busqueda')
  findAllBusqueda() {
    return this.proveedorService.findAllBusqueda();
  }

  @Auth(...rolesProveedores)
  @Get('rfc')
  findByRfc(
    @Query('rfc') rfc: string
  ) {
    return this.proveedorService.findByRfc(rfc);
  }

  @Auth(...rolesProveedores)
  @Get('estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.proveedorService.obtenerEstatus(id);
  }

  @Auth(...rolesProveedores)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.proveedorService.findOne(id);
  }

  @Auth(...rolesProveedores)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProveedorDto: UpdateProveedorDto) {
    return this.proveedorService.update(id, updateProveedorDto);
  }

  @Auth(...rolesProveedores)
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.proveedorService.delete(id);
  }
}
