import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { DimensionesService } from './dimensiones.service';
import { CreateDimensionDto } from './dto/create-dimension.dto';
import { UpdateDimensionDto } from './dto/update-dimension.dto';

@Controller('catalogos/dimensiones')
export class DimensionesController {
  constructor(private readonly dimensionesService: DimensionesService) {}

  @Post()
  create(@Body() createDimensionDto: CreateDimensionDto) {
    return this.dimensionesService.create(createDimensionDto);
  }

  @Get()
  findAll(@Query('pagina') pagina:string ) {
    return this.dimensionesService.findAll(+pagina);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dimensionesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id:string, @Body() updateDimensionDto: UpdateDimensionDto) {
    return this.dimensionesService.update(id, updateDimensionDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.dimensionesService.remove(id);
  }
}
