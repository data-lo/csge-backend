import { Injectable } from '@nestjs/common';
import { CreateCarteleraGobiernoDto } from './dto/create-cartelera_gobierno.dto';
import { UpdateCarteleraGobiernoDto } from './dto/update-cartelera_gobierno.dto';

@Injectable()
export class CarteleraGobiernoService {
  create(createCarteleraGobiernoDto: CreateCarteleraGobiernoDto) {
    return 'This action adds a new carteleraGobierno';
  }

  findAll() {
    return `This action returns all carteleraGobierno`;
  }

  findOne(id: number) {
    return `This action returns a #${id} carteleraGobierno`;
  }

  update(id: number, updateCarteleraGobiernoDto: UpdateCarteleraGobiernoDto) {
    return `This action updates a #${id} carteleraGobierno`;
  }

  remove(id: number) {
    return `This action removes a #${id} carteleraGobierno`;
  }
}
