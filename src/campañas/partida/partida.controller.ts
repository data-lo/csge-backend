import { Controller, Get, Post, Body, Patch, Param, Query, ParseUUIDPipe, Delete } from '@nestjs/common';
import { PartidaService } from './partida.service';
import { CreatePartidaDto } from './dto/create-partida.dto';
import { UpdatePartidaDto } from './dto/update-partida.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CAMPAIGN_ROLES } from '../valid-modules-campanias-roles.ob';

@Controller('campanias/partidas')
export class PartidaController {
  constructor(private readonly partidaService: PartidaService) {}

  @Auth(...CAMPAIGN_ROLES)
  @Post()
  create(@Body() createPartidaDto: CreatePartidaDto) {
    return this.partidaService.create(createPartidaDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get()
  findAll( @Query('pagina') pagina: string) {
    return this.partidaService.findAll(+pagina);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('estatus/:id')
  obtenerEstatus( @Param('id', ParseUUIDPipe) id: string) {
    return this.partidaService.obtenerEstatus(id);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get('montos/:id')
  obtenerMontos( @Param('id', ParseUUIDPipe) id: string) {
    return this.partidaService.obtenerMontos(id);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.partidaService.findOne(id);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Patch('desactivar')
  desactivar(@Body('partidaId',ParseUUIDPipe) partidaId:string) {
    return this.partidaService.disableMatch(partidaId);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePartidaDto: UpdatePartidaDto) {
    return this.partidaService.update(id, updatePartidaDto);
  }

  @Auth(...CAMPAIGN_ROLES)
  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id:string){
    return this.partidaService.remove(id);
  }

}
