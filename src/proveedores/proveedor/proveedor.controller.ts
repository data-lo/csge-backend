import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ParseEnumPipe } from '@nestjs/common';
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ProveedorParcialDto } from './dto/proveedor-parcial.dto';
import { query } from 'express';
import { TipoDeServicio } from 'src/contratos/interfaces/tipo-de-servicio';

@Controller('proveedores/proveedores')
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Post()
  create(@Body() createProveedorDto: CreateProveedorDto | ProveedorParcialDto) {
    return this.proveedorService.create(createProveedorDto);
  }

  @Patch('desactivar')
  desactivarProveedor(@Body('proveedorId',ParseUUIDPipe) proveedorId:string){
    return this.proveedorService.desactivarProveedor(proveedorId);
  }

  @Patch('activar')
  activarProveedor(@Body('proveedorId',ParseUUIDPipe) proveedorId:string){
    return this.proveedorService.activarProveedor(proveedorId);
  }

  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.proveedorService.findAll(+pagina);
  }

  @Get('servicios')
  findManyByServices(
    @Query('tipoDeServicio') tipoDeServicio:string
  ) {
    return this.proveedorService.findByService(tipoDeServicio);
  }

  @Get('busqueda')
  findAllBusqueda() {
    return this.proveedorService.findAllBusqueda();
  }

  @Get('rfc')
  findByRfc(
    @Query('rfc') rfc:string
  ) {
    return this.proveedorService.findByRfc(rfc);
  }

  @Get('estatus/:id')
  obtenerEstatus(@Param('id',ParseUUIDPipe) id:string){
    return this.proveedorService.obtenerEstatus(id);
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.proveedorService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateProveedorDto: UpdateProveedorDto) {
    return this.proveedorService.update(id, updateProveedorDto);
  }

  @Delete(':id')
  delete(@Param('id',ParseUUIDPipe) id:string){
    return this.proveedorService.delete(id);
  }
}
