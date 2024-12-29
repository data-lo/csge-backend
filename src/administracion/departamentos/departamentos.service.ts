import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Departamento } from './entities/departamento.entity';
import { Repository } from 'typeorm';
import { PaginationSetter } from '../../helpers/pagination.getter'
import { handleExeptions } from '../../helpers/handleExceptions.function';
import { object } from 'joi';



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

  async findAll() {
    try{
      return await this.departamentoRepository.find();
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id:string){
    try{
      const departameto = await this.departamentoRepository.findOneBy({id:id});
      if(!departameto){
        throw new NotFoundException('Departamento no encontrado');
      };
      return departameto;
    }catch(error){
      handleExeptions(error);
    };
  }

  async findByTerm(term:string){
    try{
      const departamento = await this.departamentoRepository.findOneBy({nombre:term});
      return departamento;
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id: string, updateDepartamentoDto: UpdateDepartamentoDto) {
    try{
      const departamentoDb = await this.departamentoRepository.findOne({
        where:{id:id}
      })
      if(!
        departamentoDb) throw new NotFoundException('NO SE ENCUENTRA EL DEPARTAMENTO');
      
      Object.assign(departamentoDb,updateDepartamentoDto);
      await this.departamentoRepository.save(departamentoDb);
      return await this.findOne(id);
    
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const departamento = await this.findOne(id);
      if(departamento){
        await this.departamentoRepository.delete({id:id});
        return {message:'departamento eliminado'}
      }
    }catch(error){
      handleExeptions(error);
    }
  }
}