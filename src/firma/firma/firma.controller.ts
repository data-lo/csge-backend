import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FirmaService } from './firma.service';
import { CreateFirmaDto } from './dto/create-firma.dto';
import { UpdateFirmaDto } from './dto/update-firma.dto';

@Controller('firma')
export class FirmaController {
  constructor(private readonly firmaService: FirmaService) {}

  @Post()
  create(@Body() createFirmaDto: CreateFirmaDto) {
    return this.firmaService.create(createFirmaDto);
  }

  @Get()
  findAll() {
    return this.firmaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.firmaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFirmaDto: UpdateFirmaDto) {
    return this.firmaService.update(+id, updateFirmaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.firmaService.remove(+id);
  }
}
