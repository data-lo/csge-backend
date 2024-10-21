import { Injectable } from '@nestjs/common';
import { CreateDimensioneDto } from './dto/create-dimensione.dto';
import { UpdateDimensioneDto } from './dto/update-dimensione.dto';

@Injectable()
export class DimensionesService {
  create(createDimensioneDto: CreateDimensioneDto) {
    return 'This action adds a new dimensione';
  }

  findAll() {
    return `This action returns all dimensiones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dimensione`;
  }

  update(id: number, updateDimensioneDto: UpdateDimensioneDto) {
    return `This action updates a #${id} dimensione`;
  }

  remove(id: number) {
    return `This action removes a #${id} dimensione`;
  }
}
