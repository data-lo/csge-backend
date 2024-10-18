import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Departamento } from './entities/departamento.entity';
import { Repository } from 'typeorm';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { handleExeptions } from 'src/helpers/handleExceptions.function';


@Injectable()
export class DepartamentosService{
  
  constructor(
    @InjectRepository(Departamento)
    private departamentoRepository:Repository<Departamento>,
  ){}

  async create(createDepartamentoDto: CreateDepartamentoDto) {
    try{
      const departamento = this.departamentoRepository.create(
        createDepartamentoDto
      );
      await this.departamentoRepository.save(departamento);
      return departamento;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      return await this.departamentoRepository.find({
        skip:paginationSetter.getSkipElements(pagina),
        take:paginationSetter.castPaginationLimit()
      });
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id:string){
    try{
      const departameto = await this.departamentoRepository.findOneBy({
        id:id
      });
      if(!departameto){
        throw new NotFoundException('Departamento no encontrado');
      };
      return departameto;
    }catch(error){
      handleExeptions(error);
    };
  }

  async update(id: string, updateDepartamentoDto: UpdateDepartamentoDto) {
    try{
      const updateResult = await this.departamentoRepository.update(id,updateDepartamentoDto);
      if(updateResult.affected === 0){
        throw new NotFoundException('Departamento no encontrado');
      }
      return this.findOne(id);
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      await this.departamentoRepository.delete({id:id});
      return {deleted:true,message:'departamento eliminado'}
    }catch(error){
      handleExeptions(error);
    }
  }
}