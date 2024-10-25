import { Injectable } from '@nestjs/common';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@Injectable()
export class OrdenService {
  create(createOrdenDto: CreateOrdenDto) {
    return 'This action adds a new orden';
  }

  findAll() {
    return `This action returns all orden`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orden`;
  }

  update(id: number, updateOrdenDto: UpdateOrdenDto) {
    return `This action updates a #${id} orden`;
  }

  remove(id: number) {
    return `This action removes a #${id} orden`;
  }
}
