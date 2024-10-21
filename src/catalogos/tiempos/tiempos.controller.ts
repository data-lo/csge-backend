import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TiemposService } from './tiempos.service';
import { CreateTiempoDto } from './dto/create-tiempo.dto';
import { UpdateTiempoDto } from './dto/update-tiempo.dto';

@Controller('tiempos')
export class TiemposController {
  constructor(private readonly tiemposService: TiemposService) {}

  @Post()
  create(@Body() createTiempoDto: CreateTiempoDto) {
    return this.tiemposService.create(createTiempoDto);
  }

  @Get()
  findAll() {
    return this.tiemposService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiemposService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTiempoDto: UpdateTiempoDto) {
    return this.tiemposService.update(+id, updateTiempoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiemposService.remove(+id);
  }
}
