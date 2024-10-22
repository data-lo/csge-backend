import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CampañasService } from './campañas.service';
import { CreateCampañaDto } from './dto/create-campaña.dto';
import { UpdateCampañaDto } from './dto/update-campaña.dto';

@Controller('campañas')
export class CampañasController {
  constructor(private readonly campañasService: CampañasService) {}

  @Post()
  create(@Body() createCampañaDto: CreateCampañaDto) {
    return this.campañasService.create(createCampañaDto);
  }

  @Get()
  findAll() {
    return this.campañasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campañasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCampañaDto: UpdateCampañaDto) {
    return this.campañasService.update(+id, updateCampañaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.campañasService.remove(+id);
  }
}
