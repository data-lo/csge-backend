import { Injectable } from '@nestjs/common';
import { CreateCampañaDto } from './dto/create-campaña.dto';
import { UpdateCampañaDto } from './dto/update-campaña.dto';

@Injectable()
export class CampañasService {
  create(createCampañaDto: CreateCampañaDto) {
    return 'This action adds a new campaña';
  }

  findAll() {
    return `This action returns all campañas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} campaña`;
  }

  update(id: number, updateCampañaDto: UpdateCampañaDto) {
    return `This action updates a #${id} campaña`;
  }

  remove(id: number) {
    return `This action removes a #${id} campaña`;
  }
}
