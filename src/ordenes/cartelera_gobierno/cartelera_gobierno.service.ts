import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCarteleraGobiernoDto } from './dto/create-cartelera_gobierno.dto';
import { UpdateCarteleraGobiernoDto } from './dto/update-cartelera_gobierno.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CarteleraGobierno } from './entities/cartelera_gobierno.entity';
import { Repository } from 'typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from 'src/helpers/pagination.getter';

@Injectable()
export class CarteleraGobiernoService {

  constructor(
    @InjectRepository(CarteleraGobierno)
    private carteleraGobiernoRepository:Repository<CarteleraGobierno>
  ){}

  async create(createCarteleraGobiernoDto: CreateCarteleraGobiernoDto) {
    try{
      const carteleraGob = this.carteleraGobiernoRepository.create(createCarteleraGobiernoDto);
      await this.carteleraGobiernoRepository.save(carteleraGob);
      return carteleraGob;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  
  findAll(pagina:number) {
    try{
      const pagiantionSetter = new PaginationSetter();
      const cartelerasGobierno  = this.carteleraGobiernoRepository.find({
        take:pagiantionSetter.castPaginationLimit(),
        skip:pagiantionSetter.getSkipElements(pagina)
      });
      return cartelerasGobierno;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  findAllBusqueda() {
    try{
      const cartelerasGobierno  = this.carteleraGobiernoRepository.find();
      return cartelerasGobierno;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const cartelera = await this.carteleraGobiernoRepository.findOneBy({id:id});
      if(!cartelera) throw new NotFoundException('Caretelera no encontrada');
      return cartelera;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async update(id: string, updateCarteleraGobiernoDto: UpdateCarteleraGobiernoDto) {
    try{
      const cartelera = await this.findOne(id);
      if(cartelera){
        await this.carteleraGobiernoRepository.update(id,updateCarteleraGobiernoDto);
        return await this.findOne(id);
      }
    }catch(error:any){  
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const cartelera = await this.findOne(id);
      if(cartelera){
        await this.carteleraGobiernoRepository.delete(id);
        return {message:'Cartelera eliminada correctamente'};
      }
    }catch(error:any){
      handleExeptions(error);
    }
  }
}
