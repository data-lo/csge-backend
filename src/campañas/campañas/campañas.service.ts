import { Injectable } from '@nestjs/common';
import { CreateCampañaDto } from './dto/create-campaña.dto';
import { UpdateCampañaDto } from './dto/update-campaña.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Campaña } from './entities/campaña.entity';
import { Repository } from 'typeorm';
import { Dependencia } from '../dependencia/entities/dependencia.entity';

@Injectable()
export class CampañasService {

  constructor(
    @InjectRepository(Campaña)
    private campañaRepository:Repository<Campaña>,
    
    @InjectRepository(Dependencia)
    private dependeciaRepository:Repository<Dependencia>
  ){}

  create(createCampañaDto: CreateCampañaDto) {
    try{

    }catch(error){
      handleExeptions(error);
    }
  }

  findAll(pagina) {
    try{

    }catch(error){
      handleExeptions(error);
    }
  }

  findOne(id: string) {
    try{

    }catch(error){
      handleExeptions(error);
    }
  }

  update(id: string, updateCampañaDto: UpdateCampañaDto) {
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
