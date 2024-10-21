import { Injectable } from '@nestjs/common';
import { CreateLongitudeDto } from './dto/create-longitude.dto';
import { UpdateLongitudeDto } from './dto/update-longitude.dto';

@Injectable()
export class LongitudesService {
  create(createLongitudeDto: CreateLongitudeDto) {
    return 'This action adds a new longitude';
  }

  findAll() {
    return `This action returns all longitudes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} longitude`;
  }

  update(id: number, updateLongitudeDto: UpdateLongitudeDto) {
    return `This action updates a #${id} longitude`;
  }

  remove(id: number) {
    return `This action removes a #${id} longitude`;
  }
}
