import { Injectable } from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Color } from './entities/color.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';

@Injectable()
export class ColoresService {
  constructor(
   @InjectRepository(Color)
   private colorRepository:Repository<Color>
  ){}

  async create(createColorDto: CreateColorDto) {
      const color = this.colorRepository.create(createColorDto);
      await this.colorRepository.save(color);
      return color;
  }

  async findAll() {
    try{
      return await this.colorRepository.find({where:{
        primario:false
      }})
    }catch(error){
      handleExeptions(error);
    }
  }

  async findColorPrimario(){
    try{
      return await this.colorRepository.findOneBy({
        primario:true
      })
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id: string, updateColorDto: UpdateColorDto) {
    try{
      await this.desactivarColorPrimario();
      await this.colorRepository.update(id,updateColorDto);
      const nuevoColorPrimario = await this.findColorPrimario();
      return {message:`Color primario actualizado a ${nuevoColorPrimario}`};
    }catch(error){
      handleExeptions(error);
    }
  }

  async desactivarColorPrimario(){
    try{
      let colorPrimario = await this.findColorPrimario();
      colorPrimario.primario = false;
      await this.colorRepository.update(colorPrimario.id,colorPrimario)
      return;
    }catch(error){
      handleExeptions(error);
    }
  }
}
