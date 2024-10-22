import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateContratoModificatorioDto } from './dto/create-contratos_modificatorio.dto';
import { UpdateContratoModificatorioDto } from './dto/update-contratos_modificatorio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ContratoModificatorio } from './entities/contratos_modificatorio.entity';
import { Repository } from 'typeorm';
import { ContratosService } from '../contratos/contratos.service';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';

@Injectable()
export class ContratosModificatoriosService {
  
  constructor(
    @InjectRepository(ContratoModificatorio)
    private contratoModificatorioRepository:Repository<ContratoModificatorio>,
    private contratosService:ContratosService
  ){}
  
  async create(createContratoModificatorioDto: CreateContratoModificatorioDto) {
    try{
      const contratoModificatorio = this.contratoModificatorioRepository
                                        .create(createContratoModificatorioDto);
      await this.contratoModificatorioRepository.save(contratoModificatorio);
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(page:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const contratosModificatorios = this.contratoModificatorioRepository.find({
        skip:paginationSetter.getSkipElements(page),
        take:paginationSetter.castPaginationLimit()
      })
      return contratosModificatorios;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const contratoModificatorio = await this.contratoModificatorioRepository.findOneBy(
        {id:id}
      );
      if(!contratoModificatorio){
        throw new BadRequestException('El contrato modificatorio no existe');
      }
      return contratoModificatorio;
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id: string, updateContratoModificatorioDto: UpdateContratoModificatorioDto) {
    try{
      const contratoModificatorio = await this.findOne(id);
      if(contratoModificatorio){
        await this.contratoModificatorioRepository.update(id,updateContratoModificatorioDto);  
        return {message:'Contrato Modificatorio Actualizado'};
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      
    }catch(error){
      handleExeptions(error);
    }
  }
}
