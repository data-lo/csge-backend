import { Injectable } from '@nestjs/common';
import { CreateIvaDto } from './dto/create-iva.dto';
import { UpdateIvaDto } from './dto/update-iva.dto';

@Injectable()
export class IvaService {
  create(createIvaDto: CreateIvaDto) {
    return 'This action adds a new iva';
  }

  findAll() {
    return `This action returns all iva`;
  }

  findOne(id: number) {
    return `This action returns a #${id} iva`;
  }

  update(id: number, updateIvaDto: UpdateIvaDto) {
    return `This action updates a #${id} iva`;
  }

  remove(id: number) {
    return `This action removes a #${id} iva`;
  }
}
