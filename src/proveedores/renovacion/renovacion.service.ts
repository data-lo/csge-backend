import { Injectable } from '@nestjs/common';
import { CreateRenovacionDto } from './dto/create-renovacion.dto';
import { UpdateRenovacionDto } from './dto/update-renovacion.dto';

@Injectable()
export class RenovacionService {
  create(createRenovacionDto: CreateRenovacionDto) {
    return 'This action adds a new renovacion';
  }

  findAll() {
    return `This action returns all renovacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} renovacion`;
  }

  update(id: number, updateRenovacionDto: UpdateRenovacionDto) {
    return `This action updates a #${id} renovacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} renovacion`;
  }
}
