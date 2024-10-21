import { Injectable } from '@nestjs/common';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { Contrato } from './entities/contrato.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from '../../helpers/pagination.getter';

@Injectable()
export class ContratosService {

  constructor(
    @InjectRepository(Contrato)
    private contratoRepository:Repository<Contrato>
  ){}

  async create(createContratoDto: CreateContratoDto) {
    try{
      let montoDisponible:number = 0.00;
      
      const { 
        montoMaximoContratado,
        montoMinimoContratado,
        ...rest
      } = createContratoDto;
      if(montoMaximoContratado){
        montoDisponible = montoMaximoContratado; 
      }else{
        montoDisponible = montoMinimoContratado;
      }
      const contrato = this.contratoRepository.create({
        montoMinimoContratado:montoMinimoContratado,
        montoMaximoContratado:montoMaximoContratado,
        monto_disponible:montoDisponible,
        ...rest
      });
      await this.contratoRepository.save(contrato);
      return contrato;
    }catch(error){
      handleExeptions(error);
    }
  }

  async  findAll(pagina:number) {
    try{
        const paginationSetter = new PaginationSetter()
        const contratos = await this.contratoRepository.find({
        skip:paginationSetter.getSkipElements(pagina),
        take:paginationSetter.castPaginationLimit()
      });
      return contratos
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id:string) {
    try{

    }catch(error){

    }
  }

  update(id:string, updateContratoDto: UpdateContratoDto) {
    return `This action updates a #${id} contrato`;
  }

  remove(id:string) {
    return `This action removes a #${id} contrato`;
  }
}
