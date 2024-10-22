import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstacionService } from './estacion.service';
import { CreateEstacionDto } from './dto/create-estacion.dto';
import { UpdateEstacionDto } from './dto/update-estacion.dto';

@Controller('estacion')
export class EstacionController {
  constructor(private readonly estacionService: EstacionService) {}

  @Post()
  create(@Body() createEstacionDto: CreateEstacionDto) {
    return this.estacionService.create(createEstacionDto);
  }

  @Get()
  findAll() {
    return this.estacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEstacionDto: UpdateEstacionDto) {
    return this.estacionService.update(+id, updateEstacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estacionService.remove(+id);
  }
}
