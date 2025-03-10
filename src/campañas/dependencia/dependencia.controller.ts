import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CAMPAIGN_ROLES } from '../valid-modules-campanias-roles.ob';

@Controller('campanias/dependencias')
export class DependenciaController {
  constructor(private readonly dependenciaService: DependenciaService) {}

  @Auth(...CAMPAIGN_ROLES)
  @Post()
  create(@Body() createDependenciaDto: CreateDependenciaDto) {
    return this.dependenciaService.create(createDependenciaDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get()
  findAll() {
    return this.dependenciaService.findAll();
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('busqueda')
  findAllBusqueda() {
    return this.dependenciaService.findAllBusqueda();
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.dependenciaService.findOne(id);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateDependenciaDto: UpdateDependenciaDto) {
    return this.dependenciaService.update(id, updateDependenciaDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.dependenciaService.remove(id);
  }
}
