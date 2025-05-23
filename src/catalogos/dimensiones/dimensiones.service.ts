import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDimensionDto } from './dto/create-dimension.dto';
import { UpdateDimensionDto } from './dto/update-dimension.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Dimension } from './entities/dimension.entity';
import { Repository } from 'typeorm';
import { handleExceptions } from '../../helpers/handleExceptions.function';
import { PaginationSetter } from '../../helpers/pagination.getter';
import { LongitudesService } from '../longitudes/longitudes.service';


@Injectable()
export class DimensionesService {

  constructor(
    @InjectRepository(Dimension)
    private dimensionRepository:Repository<Dimension>,
    private longitudService:LongitudesService
  ){}

  async create(createDimensionDto: CreateDimensionDto) {
    try{
      const {longitudId, ... rest} = createDimensionDto;
      const longitud = await this.longitudService.findOne(longitudId);

      const dimension = this.dimensionRepository.create({
        longitudId:longitud,
        ...rest
      });
      await this.dimensionRepository.save(dimension);
      return dimension;
    }catch(error){
      handleExceptions(error);
    }
  }

  async findAll() {
    try{
      const dimensiones = await this.dimensionRepository.find({
        relations:{
          longitudId:true
        }
      })
      return dimensiones;
    }catch(error){
      handleExceptions(error);
    }
  }

  async findOne(id:string) {
    try{
      const dimension = this.dimensionRepository.findOne({
        where:{id:id},
        relations:{longitudId:true}
      });
      if(!dimension) throw new NotFoundException('Dimension no encontrada');
      return dimension;
    }catch(error){
      handleExceptions(error);
    }
  }

  async update(id:string, updateDimensionDto: UpdateDimensionDto) {
    try{
      
      const {longitudId, ...rest} = updateDimensionDto;

      const dimensionDb = await this.findOne(id);
      const longitudDb = await this.longitudService.findOne(longitudId);
      
      if(!dimensionDb) throw new NotFoundException('Dimension no encontrada');
      
      await this.dimensionRepository.update(id,{
        longitudId:longitudDb,
        ...rest
      });
      return await this.findOne(id);
    }catch(error){
      handleExceptions(error);
    }
  }

  async remove(id:string) {
    try{
      const dimensionDb = await this.findOne(id);
      if(!dimensionDb) throw new NotFoundException('Dimension no encontrada');
      await this.dimensionRepository.delete(id);
      return {message:'Dimension eliminada existosamente'};
    }catch(error){
      handleExceptions(error);
    }
  }
}
