import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
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
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const dependencias = await this.dependenciaRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina),
        order:{
          nombre:'ASC'
        }
      });
      return dependencias;
    }catch(error){
      handleExeptions(error);
    }
  }


  async findAllBusqueda() {
    try{
      const dependencias = await this.dependenciaRepository.find();
      return dependencias;
    }catch(error){
      handleExeptions(error);
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
      handleExeptions(error);
    }
  }

  async update(id: string, updateDependenciaDto: UpdateDependenciaDto) {
    try{
      const dependencia = await this.findOne(id);
      if(dependencia){
        await this.dependenciaRepository.update(id,updateDependenciaDto);
        return this.findOne(id); 
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const dependencia = await this.findOne(id);
      if(dependencia){
        await this.dependenciaRepository.delete(id);
        return {message:"Dependencia eliminada correctamente"};
      }
    }catch(error){
      handleExeptions(error);
    }
  }
}
