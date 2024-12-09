import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { EstacionService } from './estacion.service';
import { CreateEstacionDto } from './dto/create-estacion.dto';
import { UpdateEstacionDto } from './dto/update-estacion.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesEstacion } from './valid-estaciones-roles.ob';

@Controller('proveedores/estaciones')
export class EstacionController {
  constructor(
    private readonly estacionService: EstacionService)
  {}
  private readonly logger = new LoggerService(EstacionController.name);

  //@Auth(...rolesEstacion)
  @Post()
  create(@Body() createEstacionDto: CreateEstacionDto) {
    return this.estacionService.create(createEstacionDto);
  }

  //@Auth(...rolesEstacion)
  @Patch('desactivar')
  desactivarEstacion(@Body('estacionId',ParseUUIDPipe) estacionId:string){
    return this.estacionService.desactivarEstacion(estacionId);
  }

  //@Auth(...rolesEstacion)
  @Patch('activar')
  activarEstacion(@Body('estacionId',ParseUUIDPipe) estacionId:string){
    return this.estacionService.activarEstacion(estacionId);
  }

  //@Auth(...rolesEstacion)
  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.estacionService.findAll(+pagina);
  }

  //@Auth(...rolesEstacion)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.estacionService.findOne(id);
  }

  //@Auth(...rolesEstacion)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateEstacionDto: UpdateEstacionDto) {
    return this.estacionService.update(id, updateEstacionDto);
  }

  //@Auth(...rolesEstacion)
  @Delete(':id')
  delete(@Param('id',ParseUUIDPipe) id: string){
    return this.estacionService.delete(id);
  }
}
