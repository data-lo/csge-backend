import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ImpresionesService } from './impresiones.service';
import { CreateImpresionDto } from './dto/create-impresion.dto';
import { UpdateImpresionDto } from './dto/update-impresion.dto';

@Controller('catalogos/impresiones')
export class ImpresionesController {
  constructor(private readonly impresionesService: ImpresionesService) {}

  @Post()
  create(@Body() createImpresioneDto: CreateImpresionDto) {
    return this.impresionesService.create(createImpresioneDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.impresionesService.findAll(+pagina);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id:string) {
    return this.impresionesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id:string, @Body() updateImpresioneDto: UpdateImpresionDto) {
    return this.impresionesService.update(id, updateImpresioneDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id:string) {
    return this.impresionesService.remove(id);
  }
}
