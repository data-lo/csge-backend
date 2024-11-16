import { BadRequestException, ConsoleLogger, Injectable, NotFoundException, ParseBoolPipe } from '@nestjs/common';
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
      let ordenes:Orden[] = [];

      const ordenesIds = [ordenesDeServicioIds]
      for(const ordenId of ordenesIds){
        const orden = await this.ordenRepository.findOneBy({id:ordenId});
        if(!orden) throw new NotFoundException(`La orden con el Id ${ordenId} no se encuentra`);
        ordenes.push(orden);
      }

      const proveedor = await this.proveedrRepository.findOneBy({id:proveedorId})
      if(!proveedor) throw new NotFoundException('No se encuentra el proveedor');

      const facturaXmlData = await this.obtenerDatosDeArchivoXML(xml);
      const validacionBool = Boolean(validacionTestigo);
      
      if(proveedor.rfc !== facturaXmlData.rfc) throw new BadRequestException('RFC de la factura y RFC del proveedor no coinciden');
      if(!validacionBool) throw new BadRequestException('Validar testigo');

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
      delete factura.proveedor
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
  

}
