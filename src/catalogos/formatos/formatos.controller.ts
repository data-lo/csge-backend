import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe} from '@nestjs/common';
import { FormatosService } from './formatos.service';
import { CreateFormatoDto } from './dto/create-formato.dto';
import { UpdateFormatoDto } from './dto/update-formato.dto';

@Controller('catalogos/formatos')
export class FormatosController {
  constructor(private readonly formatosService: FormatosService) {}

  @Post()
  create(@Body() createFormatoDto: CreateFormatoDto) {
    return this.formatosService.create(createFormatoDto);
  }

  @Get()
  findAll(@Query('pagina') pagina: string) {
    return this.formatosService.findAll(+pagina);
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.formatosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateFormatoDto: UpdateFormatoDto) {
    return this.formatosService.update(id, updateFormatoDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.formatosService.remove(id);
  }
}
