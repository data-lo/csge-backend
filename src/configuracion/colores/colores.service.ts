import { Injectable } from '@nestjs/common';
import { CreateColoreDto } from './dto/create-colore.dto';
import { UpdateColoreDto } from './dto/update-colore.dto';

@Injectable()
export class ColoresService {
  create(createColoreDto: CreateColoreDto) {
    return 'This action adds a new colore';
  }

  findAll() {
    return `This action returns all colores`;
  }

  findOne(id: number) {
    return `This action returns a #${id} colore`;
  }

  update(id: number, updateColoreDto: UpdateColoreDto) {
    return `This action updates a #${id} colore`;
  }

  remove(id: number) {
    return `This action removes a #${id} colore`;
  }
}
