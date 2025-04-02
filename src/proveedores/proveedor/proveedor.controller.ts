import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ParseEnumPipe } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ProveedorParcialDto } from './dto/proveedor-parcial.dto';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';
import { LoggerService } from 'src/logger/logger.service';
import { rolesProveedores } from './valid-proveedores-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PROVIDER_TYPE_ENUM } from './enums/provider-type-enum';

@Controller('proveedores/proveedores')
export class ProveedorController {

  constructor(private readonly providerService: ProveedorService) { }

  private readonly logger = new LoggerService(ProveedorController.name);

  @Auth(...rolesProveedores)
  @Post()
  create(@Body() createProveedorDto: CreateProveedorDto | ProveedorParcialDto) {
    return this.providerService.create(createProveedorDto);
  }

  @Auth(...rolesProveedores)
  @Patch('desactivar')
  desactivarProveedor(@Body('proveedorId', ParseUUIDPipe) proveedorId: string) {
    return this.providerService.desactivateProvider(proveedorId);
  }

  @Auth(...rolesProveedores)
  @Patch('activar')
  activarProveedor(@Body('proveedorId', ParseUUIDPipe) proveedorId: string) {
    return this.providerService.activateProvider(proveedorId);
  }

  @Auth(...rolesProveedores)
  @Get()
  findAll(
    @Query('pageParam') pagina: string,) {
    return this.providerService.findAll(+pagina);
  }

  @Auth(...rolesProveedores)
  @Get('search-provider')
  getProvidersWithFilters(
    @Query('pageParam') pageParam: number,
    @Query('parameters') parameters?: string) {
    return this.providerService.getProvidersWithFilters(pageParam, parameters);
  }

  @Auth(...rolesProveedores)
  @Get('contratos/:id')
  obtenerTIPO_DE_CONTRATO(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('TIPO_DE_SERVICIO', new ParseEnumPipe(TIPO_DE_SERVICIO)) TIPO_DE_SERVICIO: TIPO_DE_SERVICIO) {
    return this.providerService.obtenerContartoDelProveedor(id, TIPO_DE_SERVICIO);
  }

  @Auth(...rolesProveedores)
  @Get('servicios')
  findManyByServices(
    @Query('TIPO_DE_SERVICIO', new ParseEnumPipe(TIPO_DE_SERVICIO)) TIPO_DE_SERVICIO: TIPO_DE_SERVICIO) {
    return this.providerService.findByService(TIPO_DE_SERVICIO);
  }

  @Auth(...rolesProveedores)
  @Get('busqueda')
  findAllBusqueda() {
    return this.providerService.findAllBusqueda();
  }

  @Auth(...rolesProveedores)
  @Get('rfc')
  findByRfc(
    @Query('rfc') rfc: string
  ) {
    return this.providerService.findByRfc(rfc);
  }

  @Auth(...rolesProveedores)
  @Get('estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.providerService.obtenerEstatus(id);
  }

  @Auth(...rolesProveedores)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.providerService.findOne(id);
  }

  @Auth(...rolesProveedores)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProveedorDto: UpdateProveedorDto) {
    return this.providerService.update(id, updateProveedorDto);
  }

  @Auth(...rolesProveedores)
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.providerService.delete(id);
  }
}
