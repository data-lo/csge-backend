import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { IvaService } from './iva.service';
import { CreateIvaDto } from './dto/create-iva.dto';
import { UpdateIvaDto } from './dto/update-iva.dto';

@Controller('configuracion/iva')
export class IvaController {
  constructor(private readonly ivaService: IvaService) {}

  @Post()
  create(@Body() createIvaDto: CreateIvaDto) {
    return this.ivaService.create(createIvaDto);
  }

  @Get('nacional')
  findIvaNacional() {
    return this.ivaService.obtenerIvaNacional();
  }

  @Get('frontera')
  findIvaFrontera() {
    return this.ivaService.obtenerIvaFrontera();
  }

  @Get()
  findAll() {
    return this.ivaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.ivaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateIvaDto: UpdateIvaDto) {
    return this.ivaService.update(id, updateIvaDto);
  }
}

