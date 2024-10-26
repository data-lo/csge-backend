import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarteleraGobiernoService } from './cartelera_gobierno.service';
import { CreateCarteleraGobiernoDto } from './dto/create-cartelera_gobierno.dto';
import { UpdateCarteleraGobiernoDto } from './dto/update-cartelera_gobierno.dto';

@Controller('cartelera-gobierno')
export class CarteleraGobiernoController {
  constructor(private readonly carteleraGobiernoService: CarteleraGobiernoService) {}

  @Post()
  create(@Body() createCarteleraGobiernoDto: CreateCarteleraGobiernoDto) {
    return this.carteleraGobiernoService.create(createCarteleraGobiernoDto);
  }

  @Get()
  findAll() {
    return this.carteleraGobiernoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carteleraGobiernoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarteleraGobiernoDto: UpdateCarteleraGobiernoDto) {
    return this.carteleraGobiernoService.update(+id, updateCarteleraGobiernoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carteleraGobiernoService.remove(+id);
  }
}
