import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivacionService } from './activacion.service';
import { CreateActivacionDto } from './dto/create-activacion.dto';
import { UpdateActivacionDto } from './dto/update-activacion.dto';

@Controller('activacion')
export class ActivacionController {
  constructor(private readonly activacionService: ActivacionService) {}

  @Post()
  create(@Body() createActivacionDto: CreateActivacionDto) {
    return this.activacionService.create(createActivacionDto);
  }

  @Get()
  findAll() {
    return this.activacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivacionDto: UpdateActivacionDto) {
    return this.activacionService.update(+id, updateActivacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activacionService.remove(+id);
  }
}
