import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RespFirmaService } from './resp_firma.service';
import { CreateRespFirmaDto } from './dto/create-resp_firma.dto';
import { UpdateRespFirmaDto } from './dto/update-resp_firma.dto';

@Controller('configuracion/responsable-firma')
export class RespFirmaController {
  constructor(private readonly respFirmaService: RespFirmaService) {}

  @Post()
  create(@Body() createRespFirmaDto: CreateRespFirmaDto) {
    return this.respFirmaService.create(createRespFirmaDto);
  }

  @Get()
  findAll() {
    return this.respFirmaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.respFirmaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRespFirmaDto: UpdateRespFirmaDto) {
    return this.respFirmaService.update(+id, updateRespFirmaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.respFirmaService.remove(+id);
  }
}
