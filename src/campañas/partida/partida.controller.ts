import { Controller, Get, Post, Body, Patch, Param, Query, ParseUUIDPipe, Delete } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { CreatePartidaDto } from './dto/create-partida.dto';
import { UpdatePartidaDto } from './dto/update-partida.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesCampanias } from '../valid-modules-campanias-roles.ob';

@Controller('campanias/partidas')
export class PartidaController {
  constructor(private readonly partidaService: PartidaService) {}

  @Auth(...rolesCampanias)
  @Post()
  create(@Body() createPartidaDto: CreatePartidaDto) {
    return this.partidaService.create(createPartidaDto);
  }

  @Auth(...rolesCampanias)
  @Get()
  findAll( @Query('pagina') pagina: string) {
    return this.partidaService.findAll(+pagina);
  }

  @Auth(...rolesCampanias)
  @Get('estatus/:id')
  obtenerEstatus( @Param('id', ParseUUIDPipe) id: string) {
    return this.partidaService.obtenerEstatus(id);
  }

  @Auth(...rolesCampanias)
  @Get('montos/:id')
  obtenerMontos( @Param('id', ParseUUIDPipe) id: string) {
    return this.partidaService.obtenerMontos(id);
  }

  @Auth(...rolesCampanias)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.partidaService.findOne(id);
  }

  @Auth(...rolesCampanias)
  @Patch('desactivar')
  desactivar(@Body('partidaId',ParseUUIDPipe) partidaId:string) {
    return this.partidaService.desactivarPartida(partidaId);
  }

  @Auth(...rolesCampanias)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePartidaDto: UpdatePartidaDto) {
    return this.partidaService.update(id, updatePartidaDto);
  }

  @Auth(...rolesCampanias)
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id:string){
    return this.partidaService.remove(id);
  }

}
