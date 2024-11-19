import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { CarteleraGobiernoService } from './cartelera_gobierno.service';
import { CreateCarteleraGobiernoDto } from './dto/create-cartelera_gobierno.dto';
import { UpdateCarteleraGobiernoDto } from './dto/update-cartelera_gobierno.dto';

@Controller('ordenes/cartelera-gobierno')
export class CarteleraGobiernoController {
  constructor(private readonly carteleraGobiernoService: CarteleraGobiernoService) {}

  @Post()
  create(@Body() createCarteleraGobiernoDto: CreateCarteleraGobiernoDto) {
    return this.carteleraGobiernoService.create(createCarteleraGobiernoDto);
  }
  
  @Get()
  findAll(@Query('pagina') pagina:string) {
    return this.carteleraGobiernoService.findAll(+pagina);
  }

  @Get('busqueda')
  findAllBusqueda() {
    return this.carteleraGobiernoService.findAllBusqueda();
  }

  @Get(':id')
  findOne(@Param('id',ParseUUIDPipe) id: string) {
    return this.carteleraGobiernoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id',ParseUUIDPipe) id: string, @Body() updateCarteleraGobiernoDto: UpdateCarteleraGobiernoDto) {
    return this.carteleraGobiernoService.update(id, updateCarteleraGobiernoDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseUUIDPipe) id: string) {
    return this.carteleraGobiernoService.remove(id);
  }
}
