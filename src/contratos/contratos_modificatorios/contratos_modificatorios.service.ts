import { Injectable } from '@nestjs/common';
import { CreateContratoModificatorioDto } from './dto/create-contratos_modificatorio.dto';
import { UpdateContratoModificatorioDto } from './dto/update-contratos_modificatorio.dto';

@Injectable()
export class ContratosModificatoriosService {
  create(createContratosModificatorioDto: CreateContratoModificatorioDto) {
    return 'This action adds a new contratosModificatorio';
  }

  findAll() {
    return `This action returns all contratosModificatorios`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contratosModificatorio`;
  }

  update(id: number, updateContratosModificatorioDto: UpdateContratoModificatorioDto) {
    return `This action updates a #${id} contratosModificatorio`;
  }

  remove(id: number) {
    return `This action removes a #${id} contratosModificatorio`;
  }
}
