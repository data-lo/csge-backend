import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ServicioContratadoService } from './servicio_contratado.service';
import { CreateServicioContratadoDto } from './dto/create-servicio_contratado.dto';
import { UpdateServicioContratadoDto } from './dto/update-servicio_contratado.dto';

@Controller('ordenes/servicio-contratado')
export class ServicioContratadoController {
  constructor(private readonly servicioContratadoService: ServicioContratadoService) {}

  @Post()
  create(@Body() createServicioContratadoDto: CreateServicioContratadoDto) {
    return this.servicioContratadoService.create(createServicioContratadoDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:string ) {
    return this.servicioContratadoService.findAll(+pagina);
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.servicioContratadoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateServicioContratadoDto: UpdateServicioContratadoDto) {
    return this.servicioContratadoService.update(id, updateServicioContratadoDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.servicioContratadoService.remove(id);
  }
}
