import { Injectable } from '@nestjs/common';
import { CreateTiempoDto } from './dto/create-tiempo.dto';
import { UpdateTiempoDto } from './dto/update-tiempo.dto';

@Injectable()
export class TiemposService {
  create(createTiempoDto: CreateTiempoDto) {
    return 'This action adds a new tiempo';
  }

  findAll() {
    return `This action returns all tiempos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tiempo`;
  }

  update(id: number, updateTiempoDto: UpdateTiempoDto) {
    return `This action updates a #${id} tiempo`;
  }

  remove(id: number) {
    return `This action removes a #${id} tiempo`;
  }
}
