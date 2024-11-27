import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { LongitudesService } from './longitudes.service';
import { CreateLongitudDto } from './dto/create-longitud.dto';
import { UpdateLongitudDto } from './dto/update-longitud.dto';

@Controller('catalogos/longitudes')
export class LongitudesController {
  constructor(private readonly longitudesService: LongitudesService) {}

  @Post()
  create(@Body() createLongitudeDto: CreateLongitudDto) {
    return this.longitudesService.create(createLongitudeDto);
  }

  @Get()
  findAll() {
    return this.longitudesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.longitudesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateLongitudeDto: UpdateLongitudDto) {
    return this.longitudesService.update(id, updateLongitudeDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.longitudesService.remove(id);
  }
}
