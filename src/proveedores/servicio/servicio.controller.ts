import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesServicios } from './valid-servicios-roles.ob';

@Controller('proveedores/servicios')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}
  private readonly logger = new LoggerService(ServicioController.name);

  //@Auth(...rolesServicios)  
  @Post()
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.servicioService.create(createServicioDto);
  }

  //@Auth(...rolesServicios)
  @Patch('desactivar')
  desactivarServicio(@Body('servicioId',ParseUUIDPipe) servicioId:string){
    return this.servicioService.desactivarServicio(servicioId);
  }

  //@Auth(...rolesServicios)
  @Patch('activar')
  activarServicio(@Body('servicioId',ParseUUIDPipe) servicioId:string){
    return this.servicioService.desactivarServicio(servicioId);
  }

  //@Auth(...rolesServicios)
  @Patch('renovar')
  renovarServicio(){

  }

  //@Auth(...rolesServicios)
  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.servicioService.findAll(+pagina);
  }

  //@Auth(...rolesServicios)
  @Get('estatus/:id')
  obtenerEstatus(@Param('id',ParseUUIDPipe) id: string) {
    return this.servicioService.obtenerEstatus(id);
  }

  //@Auth(...rolesServicios)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.servicioService.findOne(id);
  }

  //@Auth(...rolesServicios)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateServicioDto: UpdateServicioDto) {
    return this.servicioService.update(id, updateServicioDto);
  }

}
