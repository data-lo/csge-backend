import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { RespFirmaService } from './resp_firma.service';
import { CreateRespFirmaDto } from './dto/create-resp_firma.dto';
import { UpdateRespFirmaDto } from './dto/update-resp_firma.dto';
import { AgregarResponsableDto } from './dto/agregar-resposnable.dto';

@Controller('configuracion/responsable-firma')
export class RespFirmaController {
  constructor(private readonly respFirmaService: RespFirmaService) {}

  @Post()
  create(@Body() createRespFirmaDto: CreateRespFirmaDto) {
    return this.respFirmaService.create(createRespFirmaDto);
  }

  @Post('agregar-responsable')
  agregarResponsable(@Body() agregarResponsableDto:AgregarResponsableDto) {
    return this.respFirmaService.agregarResponsable(agregarResponsableDto);
  }

  @Get()
  findAll() {
    return this.respFirmaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.respFirmaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateRespFirmaDto: UpdateRespFirmaDto) {
    return this.respFirmaService.update(id, updateRespFirmaDto);
  }

  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.respFirmaService.remove(id);
  }
}
