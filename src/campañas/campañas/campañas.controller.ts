import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { CampañasService } from './campañas.service';
import { CreateCampañaDto } from './dto/create-campaña.dto';
import { UpdateCampañaDto } from './dto/update-campaña.dto';
import { CreateActivacionDto } from '../activacion/dto/create-activacion.dto';

@Controller('campanias/campanias')
export class CampañasController {
  constructor(
    private readonly campañasService: CampañasService
  ){}

  @Post()
  create(@Body() createCampañaDto: CreateCampañaDto) {
    return this.campañasService.create(createCampañaDto);
  }

  @Get()
  findAll( @Query('pagina') pagina:string) {
    return this.campañasService.findAll(+pagina);
  }

  @Get('estatus/:id')
  estatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.campañasService.verificarEstatus(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campañasService.findOne(id);
  }

  @Patch('activar/:id')
  activar(@Param('id', ParseUUIDPipe) id: string, @Body() createActivacionDto: CreateActivacionDto) {
    return this.campañasService.agregarActivacion(id,createActivacionDto);
  }

  @Patch('cancelar/:id')
  cancelar(@Body('campañaId', ParseUUIDPipe) id:string) {
    return this.campañasService.cancelarCampaña(id);
  }
  
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCampañaDto: UpdateCampañaDto) {
    return this.campañasService.update(id, updateCampañaDto);
  }  

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.campañasService.remove(id);
  }
}
