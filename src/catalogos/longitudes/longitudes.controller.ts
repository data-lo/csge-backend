import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LongitudesService } from './longitudes.service';
import { CreateLongitudeDto } from './dto/create-longitude.dto';
import { UpdateLongitudeDto } from './dto/update-longitude.dto';

@Controller('longitudes')
export class LongitudesController {
  constructor(private readonly longitudesService: LongitudesService) {}

  @Post()
  create(@Body() createLongitudeDto: CreateLongitudeDto) {
    return this.longitudesService.create(createLongitudeDto);
  }

  @Get()
  findAll() {
    return this.longitudesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.longitudesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLongitudeDto: UpdateLongitudeDto) {
    return this.longitudesService.update(+id, updateLongitudeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.longitudesService.remove(+id);
  }
}
