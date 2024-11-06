import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { Proveedor } from './entities/proveedor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProveedorParcialDto } from './dto/proveedor-parcial.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';

@Injectable()
export class ProveedorService {

  constructor(
    @InjectRepository(Proveedor)
    private proveedorRepository:Repository<Proveedor>
  ){}


  async create(createProveedorDto: CreateProveedorDto | ProveedorParcialDto) {
    try{
      const proveedor = this.proveedorRepository.create(createProveedorDto);
      await this.proveedorRepository.save(proveedor);
      return proveedor;
    }catch(error){
     handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const proveedores = this.proveedorRepository.find({
        skip:paginationSetter.getSkipElements(pagina),
        take:paginationSetter.castPaginationLimit(),
        relations:{
          estaciones:{
            municipios:true
          }
        }
      });
      return proveedores;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const proveedor = this.proveedorRepository.findOne({
        where:{id:id},
        relations:{
          contactos:true,
          estaciones:{
            municipios:true
          },
          contratos:true,
        }
      });
      if(!proveedor) throw new NotFoundException('No se encuentra el proveedor');
      return proveedor;
    }catch(error){
      handleExeptions(error);
    }
  }

  async update(id: string, updateProveedorDto: UpdateProveedorDto) {
    try{
      const proveedorDb = await this.findOne(id);
      if(proveedorDb){
        console.log(updateProveedorDto.nombreComercial);
        await this.proveedorRepository.update(id,updateProveedorDto);
        return await this.findOne(id);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async obtenerEstatus(id:string){
    try{
      const proveedor = await this.proveedorRepository.findOne({
        where:{id:id}
      });
      if(!proveedor) throw new NotFoundException('No se encuentra el proveedor');
      return {id:proveedor.id,estatus:proveedor.estatus}
    }catch(error){
      handleExeptions(error);
    }
  }

  async desactivarProveedor(id:string){
    try{
      const estatusProveedor = await this.obtenerEstatus(id);
      if(estatusProveedor){
        await this.proveedorRepository.update(id,{
          estatus:false
        });
        return {message:'Proveedor desactivado exitosamente'};
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async activarProveedor(id:string){
    try{
      const estatusProveedor = await this.obtenerEstatus(id);
      if(estatusProveedor){
        await this.proveedorRepository.update(id,{
          estatus:true
        });
        return {message:'Proveedor activado exitosamente'};
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async delete(id:string){
    try{
      const proveedor = await this.findOne(id);
      if(proveedor){
        await this.proveedorRepository.delete(id);
        return {message:'Proveedor eliminado exitosamente'};
      }
    }catch(error){
      handleExeptions(error);
    }
  }

}
