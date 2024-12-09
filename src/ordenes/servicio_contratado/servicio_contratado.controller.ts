import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ServicioContratadoService } from './servicio_contratado.service';
import { CreateServicioContratadoDto } from './dto/create-servicio_contratado.dto';
import { UpdateServicioContratadoDto } from './dto/update-servicio_contratado.dto';
import { LoggerService } from 'src/logger/logger.service';
import { rolesServicioContratado } from './valid-servicio-contratado-roles.ob';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('ordenes/servicio-contratado')
export class ServicioContratadoController {
  constructor(private readonly servicioContratadoService: ServicioContratadoService) {}
  private readonly logger = new LoggerService(ServicioContratadoController.name);

  //@Auth(...rolesServicioContratado)
  @Post()
  create(@Body() createServicioContratadoDto: CreateServicioContratadoDto) {
    return this.servicioContratadoService.create(createServicioContratadoDto);
  }

  //@Auth(...rolesServicioContratado)
  @Get()
  findAll(@Query('pagina') pagina:string ) {
    return this.servicioContratadoService.findAll(+pagina);
  }

  //@Auth(...rolesServicioContratado)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.servicioContratadoService.findOne(id);
  }

  //@Auth(...rolesServicioContratado)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateServicioContratadoDto: UpdateServicioContratadoDto) {
    return this.servicioContratadoService.update(id, updateServicioContratadoDto);
  }

  //@Auth(...rolesServicioContratado)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.servicioContratadoService.remove(id);
  }
}
