import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DimensionesService } from './dimensiones.service';
import { CreateDimensioneDto } from './dto/create-dimensione.dto';
import { UpdateDimensioneDto } from './dto/update-dimensione.dto';

@Controller('dimensiones')
export class DimensionesController {
  constructor(private readonly dimensionesService: DimensionesService) {}

  @Post()
  create(@Body() createDimensioneDto: CreateDimensioneDto) {
    return this.dimensionesService.create(createDimensioneDto);
  }

  @Get()
  findAll() {
    return this.dimensionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dimensionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDimensioneDto: UpdateDimensioneDto) {
    return this.dimensionesService.update(+id, updateDimensioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dimensionesService.remove(+id);
  }
}
