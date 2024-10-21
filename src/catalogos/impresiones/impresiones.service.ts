import { Injectable } from '@nestjs/common';
import { CreateImpresioneDto } from './dto/create-impresione.dto';
import { UpdateImpresioneDto } from './dto/update-impresione.dto';

@Injectable()
export class ImpresionesService {
  create(createImpresioneDto: CreateImpresioneDto) {
    return 'This action adds a new impresione';
  }

  findAll() {
    return `This action returns all impresiones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} impresione`;
  }

  update(id: number, updateImpresioneDto: UpdateImpresioneDto) {
    return `This action updates a #${id} impresione`;
  }

  remove(id: number) {
    return `This action removes a #${id} impresione`;
  }
}
