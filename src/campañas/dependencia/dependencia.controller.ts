import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';

@Controller('campanias/dependencias')
export class DependenciaController {
  constructor(private readonly dependenciaService: DependenciaService) {}

  @Post()
  create(@Body() createDependenciaDto: CreateDependenciaDto) {
    return this.dependenciaService.create(createDependenciaDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.dependenciaService.findAll(+pagina);
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.dependenciaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateDependenciaDto: UpdateDependenciaDto) {
    return this.dependenciaService.update(id, updateDependenciaDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.dependenciaService.remove(id);
  }
}
