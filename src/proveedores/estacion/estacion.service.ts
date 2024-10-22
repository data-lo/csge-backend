import { Injectable } from '@nestjs/common';
import { CreateEstacionDto } from './dto/create-estacion.dto';
import { UpdateEstacionDto } from './dto/update-estacion.dto';

@Injectable()
export class EstacionService {
  create(createEstacionDto: CreateEstacionDto) {
    return 'This action adds a new estacion';
  }

  findAll() {
    return `This action returns all estacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} estacion`;
  }

  update(id: number, updateEstacionDto: UpdateEstacionDto) {
    return `This action updates a #${id} estacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} estacion`;
  }
}
