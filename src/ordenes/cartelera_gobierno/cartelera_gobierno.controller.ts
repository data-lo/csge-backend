import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { CarteleraGobiernoService } from './cartelera_gobierno.service';
import { CreateCarteleraGobiernoDto } from './dto/create-cartelera_gobierno.dto';
import { UpdateCarteleraGobiernoDto } from './dto/update-cartelera_gobierno.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { rolesCartelera } from './valid-carteleras-roles.ob';


@Controller('ordenes/cartelera-gobierno')
export class CarteleraGobiernoController {
  constructor(private readonly carteleraGobiernoService: CarteleraGobiernoService) { }


  @Auth(...rolesCartelera)
  @Post()
  create(@Body() createCarteleraGobiernoDto: CreateCarteleraGobiernoDto) {
    return this.carteleraGobiernoService.create(createCarteleraGobiernoDto);
  }

  @Auth(...rolesCartelera)
  @Get()
  findAll(@Query('pagina') pagina: string) {
    return this.carteleraGobiernoService.findAll(+pagina);
  }

  @Auth(...rolesCartelera)
  @Get('filters')
  getCampaignsWithFilters(
    @Query('pageParam') pageParam: number,
    @Query('searchParams') searchParams?: string,
  ) {
    return this.carteleraGobiernoService.getBillboardWithFilters(pageParam, searchParams);
  }

  @Auth(...rolesCartelera)
  @Get('busqueda')
  findAllBusqueda() {
    return this.carteleraGobiernoService.findAllBusqueda();
  }

  @Auth(...rolesCartelera)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.carteleraGobiernoService.findOne(id);
  }

  @Auth(...rolesCartelera)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCarteleraGobiernoDto: UpdateCarteleraGobiernoDto) {
    return this.carteleraGobiernoService.update(id, updateCarteleraGobiernoDto);
  }

  @Auth(...rolesCartelera)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.carteleraGobiernoService.remove(id);
  }
}
