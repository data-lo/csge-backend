import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { RenovacionService } from './renovacion.service';
import { CreateRenovacionDto } from './dto/create-renovacion.dto';
import { DesactivarRenovacionDto } from './dto/desactivar-renovacion.dto';
import { LoggerService } from 'src/logger/logger.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesRenovaciones } from './valid-renovaciones-roles.ob';

@Controller('proveedores/renovaciones')
export class RenovacionController {
  constructor(private readonly renovacionService: RenovacionService) {}
  private readonly logger = new LoggerService(RenovacionController.name);

  @Auth(...rolesRenovaciones)
  @Post()
  create(@Body() createRenovacionDto: CreateRenovacionDto) {
    return this.renovacionService.create(createRenovacionDto);
  }

  @Auth(...rolesRenovaciones)
  @Patch('desactivar')
  desactivarRenovacion(@Body() desactivarRenovacionDto: DesactivarRenovacionDto) {
    return this.renovacionService.desactivarRenovacion(desactivarRenovacionDto);
  }

  @Auth(...rolesRenovaciones)
  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.renovacionService.findAll(+pagina);
  }

  @Auth(...rolesRenovaciones)
  @Get('estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.renovacionService.obtenerEstatus(id);
  }

  @Auth(...rolesRenovaciones)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.renovacionService.findOne(id);
  }

  @Auth(...rolesRenovaciones)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.renovacionService.remove(id);
  }
}
