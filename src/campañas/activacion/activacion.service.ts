import { Injectable } from '@nestjs/common';
import { CreateActivacionDto } from './dto/create-activacion.dto';
import { UpdateActivacionDto } from './dto/update-activacion.dto';

@Injectable()
export class ActivacionService {
  create(createActivacionDto: CreateActivacionDto) {
    return 'This action adds a new activacion';
  }

  findAll() {
    return `This action returns all activacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activacion`;
  }

  update(id: number, updateActivacionDto: UpdateActivacionDto) {
    return `This action updates a #${id} activacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} activacion`;
  }
}
