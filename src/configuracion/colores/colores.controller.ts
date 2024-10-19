import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, ParseBoolPipe } from '@nestjs/common';
import { ColoresService } from './colores.service';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Controller('configuracion/colores')
export class ColoresController {
  constructor(private readonly coloresService: ColoresService) {}

  @Post()
  create(@Body() createColoreDto: CreateColorDto) {
    return this.coloresService.create(createColoreDto);
  }

  @Get()
  findAll() {
    return this.coloresService.findAll();
  }

  @Get('primario')
  findOne() {
    return this.coloresService.findColorPrimario();
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateColoreDto: UpdateColorDto) {
    return this.coloresService.update(id, updateColoreDto);
  }
}
