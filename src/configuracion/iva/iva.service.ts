import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateIvaDto } from './dto/create-iva.dto';
import { UpdateIvaDto } from './dto/update-iva.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Iva } from './entities/iva.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { Territorio } from './interfaces/territorios';

@Injectable()
export class IvaService {

  constructor(
    @InjectRepository(Iva)
    private ivaRepositroy:Repository<Iva>
  ){}
  
  
  async create(createIvaDto: CreateIvaDto) {
    try{
      const iva = this.ivaRepositroy.create(createIvaDto);
      await this.ivaRepositroy.save(iva);
      return {
        "id":iva.id,
        "porcentaje":(iva.porcentaje*100),
        "territorio":iva.territorio
      };
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll() {
    try{
      let ivas = await this.ivaRepositroy.find();
      ivas.forEach(iva => {
        iva.porcentaje = (iva.porcentaje*100)
      });
      return ivas;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const iva = await this.ivaRepositroy.findOneBy({id:id});
      if(iva){
        return {
          "id":iva.id,
          "porcentaje":(iva.porcentaje*100),
          "territorio":iva.territorio
        };
      }
      throw new NotFoundException('El Iva no existe');
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id: string, updateIvaDto: UpdateIvaDto) {
    try{
      const iva = this.findOne(id);
      if(iva){
        const ivaActualizado = await this.ivaRepositroy.update(id,updateIvaDto);
        if(ivaActualizado.affected === 0){
          throw new NotFoundException('No se encontro IVA');
        }
        return this.findOne(id);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async obtenerIvaNacional(){
    try{
      let iva = await this.ivaRepositroy.findOneBy({territorio:Territorio.NACIONAL})
      return {
        "id":iva.id,
        "porcentaje":(iva.porcentaje*100),
        "territorio":iva.territorio
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async obtenerIvaFrontera(){
    try{
      let iva = await this.ivaRepositroy.findOneBy({territorio:Territorio.FRONTERA})
      return {
        "id":iva.id,
        "porcentaje":(iva.porcentaje*100),
        "territorio":iva.territorio
      }
    }catch(error){
      handleExeptions(error);
    }
  }
}
