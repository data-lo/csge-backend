import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDimensionDto } from './dto/create-dimension.dto';
import { UpdateDimensionDto } from './dto/update-dimension.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dimension } from './entities/dimension.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';


@Injectable()
export class DimensionesService {

  constructor(
    @InjectRepository(Dimension)
    private dimensionRepository:Repository<Dimension>
  ){}

  async create(createDimensionDto: CreateDimensionDto) {
    try{
      const dimension = this.dimensionRepository.create(createDimensionDto);
      await this.dimensionRepository.save(dimension);
      return dimension;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const dimensiones = await this.dimensionRepository.find({
        take:paginationSetter.getSkipElements(pagina),
        skip:paginationSetter.castPaginationLimit()
      })
      return dimensiones;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id:string) {
    try{
      const dimension = this.dimensionRepository.findOne({
        where:{id:id}
      });
      if(!dimension) throw new NotFoundException('Dimension no encontrada');
      return dimension;
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id:string, updateDimensionDto: UpdateDimensionDto) {
    try{
      const dimensionDb = await this.findOne(id);
      if(dimensionDb){
        await this.dimensionRepository.update(id,updateDimensionDto);
        return await this.findOne(id);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id:string) {
    try{
      const dimensionDb = await this.findOne(id);
      if(dimensionDb){
        await this.dimensionRepository.delete(id);
        return {message:'Dimension eliminada existosamente'};
      }
    }catch(error){
      handleExeptions(error);
    }
  }
}
