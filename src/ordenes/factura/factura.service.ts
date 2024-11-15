import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Repository } from 'typeorm';
import { Orden } from '../orden/entities/orden.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { join } from 'path';
import * as fs from 'fs';


@Injectable()
export class FacturaService {
  
  private readonly rutaDeCarga = join(__dirname,'../../../');
  
  constructor(
    @InjectRepository(Factura)
    private facturaRepository:Repository<Factura>,
    
    @InjectRepository(Orden)
    private ordenRepository:Repository<Orden>,

    @InjectRepository(Proveedor)
    private proveedrRepository:Repository<Proveedor>,

  ){}

  async create(createFacturaDto: CreateFacturaDto) {
    try{
      const {ordenesDeServicioIds, proveedorId, ...rest} = createFacturaDto; 
      let ordenes:Orden[] = [];

      for(const ordenId of ordenesDeServicioIds){
        const orden = await this.ordenRepository.findOneBy({id:ordenId});
        if(!orden) throw new NotFoundException(`La orden con el Id ${ordenId} no se encuentra`);
        ordenes.push(orden);
      }

      const proveedor = await this.proveedrRepository.findOneBy({id:proveedorId})
      if(!proveedor) throw new NotFoundException('No se encuentra el proveedor');

      const factura = this.facturaRepository.create({
        ordenesDeServicio:ordenes,
        proveedor:proveedor,
        ...rest,
      });

      await this.facturaRepository.save(factura);
      return factura;
      
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async update(id: string, updateFacturaDto: UpdateFacturaDto) {
    try{
      
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      
    }catch(error:any){
      handleExeptions(error);
    }
  }

  obtenerDatosDeArchivoXML(rutaXml:string){
    try{
      
      const convertidor = require('xml-js');
      const rutaCompletaXml = this.rutaDeCarga+rutaXml;

      const xml = fs.readdirSync(rutaCompletaXml);

      const resultadoEnJson = convertidor.xml2js(
        xml,{
          compact:false,spaces:4
        });
        return resultadoEnJson;

    }catch(error){
      handleExeptions(error);
    }
  }

  esperarElArchivo(rutaDeArchivo:string, timeout = 2000){
    const dirPath = rutaDeArchivo;
    return new Promise((resolve, reject) => {
      const watcher = fs.watch(dirPath)
    })
  }

}
