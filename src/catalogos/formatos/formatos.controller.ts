import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FormatosService } from './formatos.service';
import { CreateFormatoDto } from './dto/create-formato.dto';
import { UpdateFormatoDto } from './dto/update-formato.dto';

@Controller('formatos')
export class FormatosController {
  constructor(private readonly formatosService: FormatosService) {}

  @Post()
  create(@Body() createFormatoDto: CreateFormatoDto) {
    return this.formatosService.create(createFormatoDto);
  }

  @Get()
  findAll() {
    return this.formatosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formatosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFormatoDto: UpdateFormatoDto) {
    return this.formatosService.update(+id, updateFormatoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formatosService.remove(+id);
  }
}
