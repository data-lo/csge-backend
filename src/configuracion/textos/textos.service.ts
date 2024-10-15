import { Injectable } from '@nestjs/common';
import { CreateTextoDto } from './dto/create-texto.dto';
import { UpdateTextoDto } from './dto/update-texto.dto';

@Injectable()
export class TextosService {
  create(createTextoDto: CreateTextoDto) {
    return 'This action adds a new texto';
  }

  findAll() {
    return `This action returns all textos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} texto`;
  }

  update(id: number, updateTextoDto: UpdateTextoDto) {
    return `This action updates a #${id} texto`;
  }

  remove(id: number) {
    return `This action removes a #${id} texto`;
  }
}
