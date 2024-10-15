import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IvaService } from './iva.service';
import { CreateIvaDto } from './dto/create-iva.dto';
import { UpdateIvaDto } from './dto/update-iva.dto';

@Controller('iva')
export class IvaController {
  constructor(private readonly ivaService: IvaService) {}

  @Post()
  create(@Body() createIvaDto: CreateIvaDto) {
    return this.ivaService.create(createIvaDto);
  }

  @Get()
  findAll() {
    return this.ivaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ivaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIvaDto: UpdateIvaDto) {
    return this.ivaService.update(+id, updateIvaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ivaService.remove(+id);
  }
}
