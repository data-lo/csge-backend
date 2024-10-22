import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RenovacionService } from './renovacion.service';
import { CreateRenovacionDto } from './dto/create-renovacion.dto';
import { UpdateRenovacionDto } from './dto/update-renovacion.dto';

@Controller('renovacion')
export class RenovacionController {
  constructor(private readonly renovacionService: RenovacionService) {}

  @Post()
  create(@Body() createRenovacionDto: CreateRenovacionDto) {
    return this.renovacionService.create(createRenovacionDto);
  }

  @Get()
  findAll() {
    return this.renovacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.renovacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRenovacionDto: UpdateRenovacionDto) {
    return this.renovacionService.update(+id, updateRenovacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.renovacionService.remove(+id);
  }
}
