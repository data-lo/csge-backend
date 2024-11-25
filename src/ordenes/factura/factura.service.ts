import { BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { handleExeptions } from 'src/helpers/handleExceptions.function';
import { InjectRepository } from '@nestjs/typeorm';
import { Factura } from './entities/factura.entity';
import { Repository } from 'typeorm';
import { Orden } from '../orden/entities/orden.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import * as path from 'path';
import * as fs from 'fs';
import * as xmls2js from 'xml-js'
import { FacturaXml } from './interfaces/xml-json.factura.interface';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { EstatusFactura } from './interfaces/estatus-factura';

@Injectable()
export class FacturaService {
  
  private readonly rutaDeCarga = path.join(__dirname,'../../../');
  
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
      
      const {ordenesDeServicioIds, proveedorId, validacionTestigo, xml, ...rest} = createFacturaDto;
      const validacionBool = Boolean(validacionTestigo);
      if(!validacionBool) throw new BadRequestException('Validar testigo');
      
      let ordenes:Orden[] = [];
      let totalDeOrdenes:number;
      
      const ordenesIds = [ordenesDeServicioIds]
      for(const ordenId of ordenesIds){
        const orden = await this.ordenRepository.findOneBy({id:ordenId});
        if(!orden) throw new NotFoundException(`La orden con el Id ${ordenId} no se encuentra`);
        totalDeOrdenes += orden.total;
        ordenes.push(orden);
      }

      const proveedor = await this.proveedrRepository.findOneBy({id:proveedorId})
      if(!proveedor) throw new NotFoundException('No se encuentra el proveedor');

      const facturaXmlData = await this.obtenerDatosDeArchivoXML(xml);
    
      if(proveedor.rfc !== facturaXmlData.rfc) throw new BadRequestException('RFC de la factura y RFC del proveedor no coinciden');
      if(totalDeOrdenes !== parseFloat(facturaXmlData.total)) throw new BadRequestException('El monto total de las ordenes y el total de la factura no coinciden');
    
      const factura = this.facturaRepository.create({
        ordenesDeServicio:ordenes,
        proveedor:proveedor,
        xml:xml,
        subtotal:facturaXmlData.subtotal,
        iva:facturaXmlData.iva,
        total:facturaXmlData.total,
        fechaDeRecepcion:new Date(),
        fechaValidacion:new Date(),
        validacionTestigo:validacionBool,
        ...rest,
      });
      
      await this.facturaRepository.save(factura);
      return factura;
      
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async findAllBusqueda(){
    try{
      const facturas = await this.facturaRepository.find({
        relations:{
          proveedor:true
        }
      });
      const facturasFilter = facturas.map((factura)=>{
        return {
          id:factura.id,
          total:factura.total,
          estatus:factura.estatus,
          proveedor:{
            nombre:factura.proveedor.nombreComercial,
            rfc:factura.proveedor.rfc
          }
        }
      });
      return facturasFilter;
    }catch(error){
      handleExeptions(error);
    }
  }

  async findAll(pagina:number) {
    try{
      const paginationSetter = new PaginationSetter()
      const facturas = await this.facturaRepository.find({
        take:paginationSetter.castPaginationLimit(),
        skip:paginationSetter.getSkipElements(pagina),
        relations:{
          proveedor:true
        },
      });
      const facturasFilter = facturas.map((factura)=>{
        return {
          id:factura.id,
          total:factura.total,
          estatus:factura.estatus,
          proveedor:{
            nombre:factura.proveedor.nombreComercial,
            rfc:factura.proveedor.rfc
          }
        }
      });
      return facturasFilter;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try{
      const factura = await this.facturaRepository.findOne({
        where:{id:id},
        relations:{
          proveedor:true,
          ordenesDeServicio:true
        },
      });
      return factura;
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try{
      const factura = await this.findOne(id);
      if(factura){

      }
    }catch(error:any){
      handleExeptions(error);
    }
  }

  async obtenerDatosDeArchivoXML(rutaXml: string) {
    try {
      const rutaCompletaXml = this.rutaDeCarga + rutaXml;
      const filePath = path.resolve(rutaCompletaXml);
  
      const xml = await fs.readFileSync(filePath, 'utf-8');
      const facturaJsonString = xmls2js.xml2json(xml, {
        compact: true,
        spaces: 4,
      });
  
      const facturaXml: FacturaXml = JSON.parse(facturaJsonString);
  
      const rfc = facturaXml['cfdi:Comprobante']['cfdi:Emisor']._attributes.Rfc;
      const subtotal = facturaXml['cfdi:Comprobante']._attributes.SubTotal;
      const total = facturaXml['cfdi:Comprobante']._attributes.Total;
      const iva =
        facturaXml['cfdi:Comprobante']['cfdi:Impuestos']._attributes
          .TotalImpuestosTrasladados;
  
      let conceptos = facturaXml['cfdi:Comprobante']['cfdi:Conceptos'];
  
      if (!Array.isArray(conceptos)) {
        conceptos = [conceptos];
      }
  
      const conceptosPrecargados = conceptos.map((concepto) => {
        const cantidad = concepto['cfdi:Concepto']._attributes.Cantidad;
        const conceptoData = concepto['cfdi:Concepto']._attributes.Descripcion;
        return {
          cantidad: cantidad,
          concepto: conceptoData,
        };
      });
  
      return {
        rfc: rfc,
        subtotal: subtotal,
        total: total,
        iva: iva,
        conceptos: conceptosPrecargados,
      };
    } catch (error) {
      handleExeptions(error);
      throw new Error('Error al procesar el archivo XML');
    }
  }
  
  async obtenerArchivosDescarga(id:string, tipoArchivo:string){
    try{
        const factura = await this.facturaRepository.findOneBy({id:id})
        if(!factura) throw new BadRequestException('No se encuentra la factura');

        if(tipoArchivo != 'xml' && tipoArchivo != 'pdf') throw new BadRequestException('Archivo no admitido');

        const rutaDeArchivo = tipoArchivo === 'xml' ? factura.xml : factura.pdf;

        const pathArchivo = path.join(this.rutaDeCarga,rutaDeArchivo);
        if(!fs.existsSync(pathArchivo)) throw new BadRequestException('No se encontro el archivo');
        return pathArchivo;
    }catch(error){
      handleExeptions(error);
    }
  }

  async eliminarArchivoDeFactura(id:string){
    try{
      const pdf = path.join(this.rutaDeCarga,'static/uploads/pdf/',`${id}.pdf`);
      const xml = path.join(this.rutaDeCarga,'static/uploads/xml/',`${id}.xml`);
      if(!fs.existsSync(pdf)) throw new BadRequestException('archivo pdf no encontrado');
      if(fs.existsSync(xml)) throw new BadRequestException('archivo xml no encontrado');
      
      fs.unlinkSync(pdf);
      fs.unlinkSync(xml);
      
      return {
        message:'Archivos xml y pdf de la factura eliminados exitosamente',
        value:true,
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async cancelarFactura(id:string, updateFacturaDto:UpdateFacturaDto){
    try{
      const {motivoDeCancelacion} = updateFacturaDto;
      const factura = await this.facturaRepository.findOneBy({id:id});
      if(!factura) throw new NotFoundException('Factura no encontrada');
      if(!motivoDeCancelacion) throw new BadRequestException('Se debe de incluir el motivo de cancelación');

      factura.motivoCancelacion = motivoDeCancelacion;
      const {message, value} = await this.eliminarArchivoDeFactura(id);

      if(value){
        await this.facturaRepository.save(factura);
        return {message:`Factura cancelada correctamente, ${message}`};
      }
    }catch(error){
      handleExeptions(error);
    }
  }

  async actualizarEstatusDeFactura(id:string,estatus:EstatusFactura){
    try{
      const factura = await this.facturaRepository.findOneBy({id:id});
      if(!factura) throw new NotFoundException('No se encontro la factura');
      factura.estatus = estatus;
      await this.facturaRepository.update(id,factura);
      return {message:'estatus de factura actualizado'};
    }
    catch(error){
      handleExeptions(error);
    }
  }

  async obtenerEstatusDeFactura(id){
    try{
      const factura = await this.facturaRepository.findOneBy(id);
      if(!factura) throw new NotFoundException('No se encontro la factura');
      return{
        id:factura.id,
        estatus:factura.estatus
      }
    }catch(error){
      handleExeptions(error);
    }
  }


  //aprobar factura
}
