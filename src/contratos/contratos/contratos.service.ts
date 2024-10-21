import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { Contrato } from './entities/contrato.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { PaginationSetter } from '../../helpers/pagination.getter';
import { EstatusDeContrato } from '../interfaces/estatus-de-contrato';

@Injectable()
export class ContratosService {

  constructor(
    @InjectRepository(Contrato)
    private contratoRepository:Repository<Contrato>
  ){}

  async create(createContratoDto: CreateContratoDto) {
    try{
      let montoDisponible:number = 0.00;
      
      const { 
        montoMaximoContratado,
        montoMinimoContratado,
        ...rest
      } = createContratoDto;
      if(montoMaximoContratado){
        montoDisponible = montoMaximoContratado; 
      }else{
        montoDisponible = montoMinimoContratado;
      }
      const contrato = this.contratoRepository.create({
        montoMinimoContratado:montoMinimoContratado,
        montoMaximoContratado:montoMaximoContratado,
        monto_disponible:montoDisponible,
        ...rest
      });
      await this.contratoRepository.save(contrato);
      return contrato;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
        const paginationSetter = new PaginationSetter()
        const contratos = await this.contratoRepository.find({
        skip:paginationSetter.getSkipElements(pagina),
        take:paginationSetter.castPaginationLimit()
      });
      return contratos
    }catch(error){
      handleExeptions(error);
    }
  }

  async findOne(id:string) {
    try{
      const contrato = await this.contratoRepository.findOneBy({id:id});
      if(!contrato){
        throw new BadRequestException('El contrato no existe');
      }
      return contrato;
    }catch(error){
      handleExeptions(error);
    }
  }

  async obtenerEstatus(id:string){
    try{
      const contrato = await this.findOne(id);
      const estatusDeContrato = contrato.estatusDeContrato;
      return {estatus:estatusDeContrato};
    }catch(error){
      handleExeptions(error);
    }
  }
  
  async modificarEstatus(id:string,updateContratoDto:UpdateContratoDto){
    try{
      const { estatusDeContrato, ...rest } = updateContratoDto;
      await this.contratoRepository.update(id,{
        estatusDeContrato:estatusDeContrato
      });
      return {message:`Estatus de contrato actuzalizado a ${estatusDeContrato}`}
    }catch(error){
      handleExeptions(error);
    } 
  }

  async update(id:string, updateContratoDto: UpdateContratoDto) {
    try{
      const estatusDelContrato = await this.obtenerEstatus(id);
      if(estatusDelContrato.estatus != EstatusDeContrato.PENDIENTE){
        throw new BadRequestException('El contrato no se encuentra PENDIENTE. Cancelar Contrato')
      }else{
        await this.contratoRepository.update(id,updateContratoDto);
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async remove(id:string) {
    try{
      const estatusDelContrato = await this.obtenerEstatus(id);
      if(estatusDelContrato.estatus != EstatusDeContrato.PENDIENTE){
        throw new BadRequestException('El contrato no cuenta con estatus PENDIENTE. Cancelar Contrato')
      }else{
        await this.contratoRepository.delete({id:id});
        return {message:'contrato eliminado'}
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async desactivarCancelarContrato(id:string,updateContratoDto:UpdateContratoDto){
    const {estatusDeContrato} = updateContratoDto
    try{
      const estatusDeContratoDb = await this.obtenerEstatus(id);
      if(estatusDeContratoDb.estatus === EstatusDeContrato.LIBERADO){
        await this.contratoRepository.update(id,{
            estatusDeContrato:estatusDeContrato
        });
        return {message:`Estatus de contrato ${estatusDeContrato}`}
      }
      else{
        throw new BadRequestException('El contrato se debe encontraro LIBERADO para desactivarse o cancelarse');
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async actualizarMontos(){}

  async agregarContratoModificatorio(){}
  
  async agregarProveedor(){}

  async eliminarProveedor(){}

  async agregarOrdenDeServicio(){}

  async eliminarOrdenDeServicio(){}

  async descargarReporte(){}
}
