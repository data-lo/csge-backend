import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesCampanias } from '../valid-modules-campanias-roles.ob';

@Controller('campanias/dependencias')
export class DependenciaController {
  constructor(private readonly dependenciaService: DependenciaService) {}

  @Auth(...rolesCampanias)
  @Post()
  create(@Body() createDependenciaDto: CreateDependenciaDto) {
    return this.dependenciaService.create(createDependenciaDto);
  }

  @Auth(...rolesCampanias)
  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.dependenciaService.findAll(+pagina);
  }

  @Auth(...rolesCampanias)
  @Get('busqueda')
  findAllBusqueda() {
    return this.dependenciaService.findAllBusqueda();
  }

  @Auth(...rolesCampanias)
  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.dependenciaService.findOne(id);
  }

  @Auth(...rolesCampanias)
  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateDependenciaDto: UpdateDependenciaDto) {
    return this.dependenciaService.update(id, updateDependenciaDto);
  }

  @Auth(...rolesCampanias)
  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.dependenciaService.remove(id);
  }
}
