import { Controller, Get, Post, Body, Patch, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { CreatePartidaDto } from './dto/create-partida.dto';
import { UpdatePartidaDto } from './dto/update-partida.dto';

@Controller('campanias/partidas')
export class PartidaController {
  constructor(private readonly partidaService: PartidaService) {}

  @Post()
  create(@Body() createPartidaDto: CreatePartidaDto) {
    return this.partidaService.create(createPartidaDto);
  }

  @Get()
  findAll( @Query('pagina') pagina: string) {
    return this.partidaService.findAll(+pagina);
  }

  @Get('estatus/:id')
  obtenerEstatus( @Param('id', ParseUUIDPipe) id: string) {
    return this.partidaService.obtenerEstatus(id);
  }

  @Get('montos/:id')
  obtenerMontos( @Param('id', ParseUUIDPipe) id: string) {
    return this.partidaService.obtenerMontos(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.partidaService.findOne(id);
  }

  @Patch('desactivar')
  desactivar(@Body('partidaId',ParseUUIDPipe) partidaId:string) {
    console.log(partidaId);
    return this.partidaService.desactivarPartida(partidaId);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePartidaDto: UpdatePartidaDto) {
    return this.partidaService.update(id, updatePartidaDto);
  }
}
