import { Injectable } from '@nestjs/common';
import { CreateRespFirmaDto } from './dto/create-resp_firma.dto';
import { UpdateRespFirmaDto } from './dto/update-resp_firma.dto';

@Injectable()
export class RespFirmaService {
  create(createRespFirmaDto: CreateRespFirmaDto) {
    return 'This action adds a new respFirma';
  }

  findAll() {
    return `This action returns all respFirma`;
  }

  findOne(id: number) {
    return `This action returns a #${id} respFirma`;
  }

  update(id: number, updateRespFirmaDto: UpdateRespFirmaDto) {
    return `This action updates a #${id} respFirma`;
  }

  remove(id: number) {
    return `This action removes a #${id} respFirma`;
  }
}
