import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { CampañasService } from './campañas.service';
import { CreateCampañaDto } from './dto/create-campaña.dto';
import { UpdateCampañaDto } from './dto/update-campaña.dto';
import { CreateActivacionDto } from '../activacion/dto/create-activacion.dto';
import { EstatusCampaña } from './interfaces/estatus-campaña.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesCampanias } from '../valid-modules-roles.ob';

@Controller('campanias/campanias')
export class CampañasController {
  constructor(
    private readonly campañasService: CampañasService
  ){}

  @Auth(...rolesCampanias)
  @Post()
  create(@Body() createCampañaDto: CreateCampañaDto) {
    return this.campañasService.create(createCampañaDto);
  }

  @Auth(...rolesCampanias)
  @Get()
  findAll( @Query('pagina') pagina:string) {
    return this.campañasService.findAll(+pagina);
  }

  @Auth(...rolesCampanias)
  @Get('busqueda')
  findAllBusqueda() {
    return this.campañasService.findAllBusuqueda();
  }

  @Auth(...rolesCampanias)
  @Get('estatus/:id')
  estatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.campañasService.verificarEstatus(id);
  }

  @Auth(...rolesCampanias)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campañasService.findOne(id);
  }

  @Auth(...rolesCampanias)
  @Patch('actualizar-estatus/:id')
  actualizarEstatus(@Param('id', ParseUUIDPipe) id: string, @Body('estatus') estatus: EstatusCampaña) {
    return this.campañasService.actualizarEstatus(id,estatus);
  }
  
  @Auth(...rolesCampanias)
  @Patch('activar/:id')
  activar(@Param('id', ParseUUIDPipe) id: string, @Body() createActivacionDto: CreateActivacionDto) {
    return this.campañasService.agregarActivacion(id,createActivacionDto);
  }

  @Auth(...rolesCampanias)
  @Patch('cancelar')
  cancelar(@Body('campañaId', ParseUUIDPipe) id:string) {
    return this.campañasService.cancelarCampaña(id);
  }
  
  @Auth(...rolesCampanias)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCampañaDto: UpdateCampañaDto) {
    return this.campañasService.update(id, updateCampañaDto);
  }  

  @Auth(...rolesCampanias)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.campañasService.remove(id);
  }
}
