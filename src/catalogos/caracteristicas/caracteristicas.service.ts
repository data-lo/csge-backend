import { Injectable } from '@nestjs/common';
import { CreateCaracteristicaDto } from './dto/create-caracteristica.dto';
import { UpdateCaracteristicaDto } from './dto/update-caracteristica.dto';

@Injectable()
export class CaracteristicasService {
  create(createCaracteristicaDto: CreateCaracteristicaDto) {
    return 'This action adds a new caracteristica';
  }

  findAll() {
    return `This action returns all caracteristicas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} caracteristica`;
  }

  update(id: number, updateCaracteristicaDto: UpdateCaracteristicaDto) {
    return `This action updates a #${id} caracteristica`;
  }

  remove(id: number) {
    return `This action removes a #${id} caracteristica`;
  }
}
