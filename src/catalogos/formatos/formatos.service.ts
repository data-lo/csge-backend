import { Injectable } from '@nestjs/common';
import { CreateFormatoDto } from './dto/create-formato.dto';
import { UpdateFormatoDto } from './dto/update-formato.dto';

@Injectable()
export class FormatosService {
  create(createFormatoDto: CreateFormatoDto) {
    return 'This action adds a new formato';
  }

  findAll() {
    return `This action returns all formatos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} formato`;
  }

  update(id: number, updateFormatoDto: UpdateFormatoDto) {
    return `This action updates a #${id} formato`;
  }

  remove(id: number) {
    return `This action removes a #${id} formato`;
  }
}
