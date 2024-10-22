import { Injectable } from '@nestjs/common';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';

@Injectable()
export class DependenciaService {
  create(createDependenciaDto: CreateDependenciaDto) {
    return 'This action adds a new dependencia';
  }

  findAll() {
    return `This action returns all dependencia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dependencia`;
  }

  update(id: number, updateDependenciaDto: UpdateDependenciaDto) {
    return `This action updates a #${id} dependencia`;
  }

  remove(id: number) {
    return `This action removes a #${id} dependencia`;
  }
}
