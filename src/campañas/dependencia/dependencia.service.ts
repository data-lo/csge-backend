import { Injectable } from '@nestjs/common';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { handleExeptions } from 'src/helpers/handleExceptions.function';

@Injectable()
export class DependenciaService {

  constructor(
    @InjectRepository(Dependencia)
    private dependenciaRepository:Repository<Dependencia>
  ){}

  async create(createDependenciaDto: CreateDependenciaDto) {
    try{
      const dependencia = this.dependenciaRepository.create(createDependenciaDto);
      await this.dependenciaRepository.save(dependencia);
      return dependencia;
    }catch(error){
      handleExeptions(error);
    }
  }

  findAll(pagina:number) {
    try{
      
    }catch(error){
      handleExeptions(error);
    }
  }

  findOne(id:string) {
    try{

    }catch(error){
      handleExeptions(error);
    }
  }

  update(id: string, updateDependenciaDto: UpdateDependenciaDto) {
    try{

    }catch(error){
      handleExeptions(error);
    }
  }

  remove(id: string) {
    try{

    }catch(error){
      handleExeptions(error);
    }
  }
}
