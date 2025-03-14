import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ActivacionService } from './activacion.service';
import { CreateActivacionDto } from './dto/create-activacion.dto';
import { UpdateActivacionDto } from './dto/update-activacion.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CAMPAIGN_ROLES } from '../valid-modules-campanias-roles.ob';

@Controller('campanias/activaciones')
export class ActivacionController {
  constructor(private readonly activacionService: ActivacionService) { }
  @Auth(...CAMPAIGN_ROLES)
  @Post()
  create(@Body() createActivacionDto: CreateActivacionDto) {
    return this.activacionService.create(createActivacionDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get()
  findAll(
    @Query('pagina') pagina: string,
    @GetUser() user: Usuario
  ) {
    return this.activacionService.findAll(+pagina);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('estatus/:id')
  obtenerEstatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.activacionService.obtenerEstatus(id);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.activacionService.findOne(id);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Patch('desactivar')
  desactivar(@Body('activacionId', ParseUUIDPipe) activacionId: string) {
    return this.activacionService.disableActivation(activacionId);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateActivacionDto: UpdateActivacionDto) {
    return this.activacionService.update(id, updateActivacionDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.activacionService.remove(id);
  }
}
