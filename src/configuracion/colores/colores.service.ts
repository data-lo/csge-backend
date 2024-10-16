import { Injectable } from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';

@Injectable()
export class ColoresService {
  create(createColoreDto: CreateColorDto) {
    return 'This action adds a new colore';
  }

  findAll() {
    return `This action returns all colores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} colore`;
  }

  update(id: number, updateColoreDto: UpdateColorDto) {
    return `This action updates a #${id} colore`;
  }

  remove(id: number) {
    return `This action removes a #${id} colore`;
  }
}
