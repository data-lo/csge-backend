import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';


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
      handleExceptions(error);
    }
  }

  async findAll() {
    try{
      const paginationSetter = new PaginationSetter()
      const dependencias = await this.dependenciaRepository.find({
        order:{
          nombre:'ASC'
        }
      });
      return dependencias;
    }catch(error){
      handleExceptions(error);
    }
  }


  async findAllBusqueda() {
    try{
      const dependencias = await this.dependenciaRepository.find();
      return dependencias;
    }catch(error){
      handleExceptions(error);
    }
  }

  async findOne(id:string) {
    try{
      const dependencia = await this.dependenciaRepository.findOne({
        where:{id:id}
      });
      if(!dependencia) throw new NotFoundException('La dependencia no existe');
      return dependencia;
    }catch(error){
      handleExceptions(error);
    }
  }

  async update(id: string, updateDependenciaDto: UpdateDependenciaDto) {
    try{
      const dependenciaDb = await this.findOne(id);
      Object.assign(dependenciaDb,updateDependenciaDto);
      await this.dependenciaRepository.save(dependenciaDb);
      return {message:'DEPENDENCIA ACTUALZIADA CORRECTAMENTE'};
    }catch(error){
      handleExceptions(error);
    }
  }

  async remove(id: string) {
    try{
      const dependenciaDb = await this.findOne(id);
      await this.dependenciaRepository.remove(dependenciaDb);
      return {message:"Dependencia eliminada correctamente"};
    }catch(error){
      handleExceptions(error);
    }
  }
}
