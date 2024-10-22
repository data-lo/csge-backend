import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';

@Controller('dependencia')
export class DependenciaController {
  constructor(private readonly dependenciaService: DependenciaService) {}

  @Post()
  create(@Body() createDependenciaDto: CreateDependenciaDto) {
    return this.dependenciaService.create(createDependenciaDto);
  }

  @Get()
  findAll() {
    return this.dependenciaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dependenciaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDependenciaDto: UpdateDependenciaDto) {
    return this.dependenciaService.update(+id, updateDependenciaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dependenciaService.remove(+id);
  }
}
