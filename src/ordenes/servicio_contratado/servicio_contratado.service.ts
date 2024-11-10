import { Injectable } from '@nestjs/common';
import { CreateServicioContratadoDto } from './dto/create-servicio_contratado.dto';
import { UpdateServicioContratadoDto } from './dto/update-servicio_contratado.dto';
import { Repository } from 'typeorm';
import { ServicioContratado } from './entities/servicio_contratado.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ServicioContratadoService {

  constructor(
    @InjectRepository(ServicioContratado)
    private servicioContratadoRepository:Repository<ServicioContratado>
  ){}

  create(createServicioContratadoDto: CreateServicioContratadoDto) {
    return 'This action adds a new servicioContratado';
  }

  findAll( pagina:string ) {
    return `This action returns all servicioContratado`;
  }

  findOne(id: string) {
    return `This action returns a #${id} servicioContratado`;
  }

  update(id: string, updateServicioContratadoDto: UpdateServicioContratadoDto) {
    return `This action updates a #${id} servicioContratado`;
  }

  remove(id: string) {
    return `This action removes a #${id} servicioContratado`;
  }
}
