import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ImpresionesService } from './impresiones.service';
import { CreateImpresioneDto } from './dto/create-impresione.dto';
import { UpdateImpresioneDto } from './dto/update-impresione.dto';

@Controller('impresiones')
export class ImpresionesController {
  constructor(private readonly impresionesService: ImpresionesService) {}

  @Post()
  create(@Body() createImpresioneDto: CreateImpresioneDto) {
    return this.impresionesService.create(createImpresioneDto);
  }

  @Get()
  findAll() {
    return this.impresionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.impresionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImpresioneDto: UpdateImpresioneDto) {
    return this.impresionesService.update(+id, updateImpresioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.impresionesService.remove(+id);
  }
}
