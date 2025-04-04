import { Injectable } from '@nestjs/common';
import { CreateColorDto } from './dto/create-color.dto';
import { UpdateColorDto } from './dto/update-color.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Color } from './entities/color.entity';
import { Repository } from 'typeorm';
import { handleExceptions } from '../../helpers/handleExceptions.function';

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
      handleExceptions(error);
    }
  }

  async findColorPrimario(){ 
    try{
      const colorPrimario = await this.colorRepository.findOneBy({
        primario:true
      })
      if(!colorPrimario){
        return false;
      }
      return colorPrimario;
    }catch(error){
      handleExceptions(error);
    }
  }

  async update(id: string, updateColorDto: UpdateColorDto) {
    try{
      await this.desactivarColorPrimario();
      await this.colorRepository.update(id,updateColorDto);
      return await this.findColorPrimario();
    }catch(error){
      handleExceptions(error);
    }
  }

  async desactivarColorPrimario(){
    try{
      let colorPrimario = await this.findColorPrimario();
      if(colorPrimario){
        colorPrimario.primario = false;
        await this.colorRepository.update(colorPrimario.id,colorPrimario)
        return;
      }else{
        return;
      }
    }catch(error){
      handleExceptions(error);
    }
  }
}
