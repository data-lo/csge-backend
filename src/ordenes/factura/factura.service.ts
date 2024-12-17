import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import * as xmls2js from 'xml-js';
import { FacturaXml } from './interfaces/xml-json.factura.interface';
import { PaginationSetter } from 'src/helpers/pagination.getter';
import { EstatusFactura } from './interfaces/estatus-factura';
import { DocumentsService } from 'src/documents/documents.service';
import { EstatusOrdenDeServicio } from '../orden/interfaces/estatus-orden-de-servicio';
import { CreateFirmaDto } from 'src/firma/firma/dto/create-firma.dto';
import { TipoDeDocumento } from 'src/administracion/usuarios/interfaces/usuarios.tipo-de-documento';
import { FirmaService } from '../../firma/firma/firma.service';
import { Usuario } from 'src/administracion/usuarios/entities/usuario.entity';

@Injectable()
export class FacturaService {
  private readonly rutaDeCarga = path.join(__dirname, '../../../');

  constructor(
    @InjectRepository(Factura)
    private facturaRepository: Repository<Factura>,
    @InjectRepository(Orden)
    private ordenRepository: Repository<Orden>,
    @InjectRepository(Proveedor)
    private proveedrRepository: Repository<Proveedor>,
    
    private readonly firmaService:FirmaService,
  ) {}

  async create(createFacturaDto: CreateFacturaDto, usuarioTestigo:Usuario) {
    try {
      const {
        ordenesDeServicioIds,
        proveedorId,
        validacionTestigo,
        xml,
        id,
        ...rest
      } = createFacturaDto;
      
      const validacionBool = Boolean(validacionTestigo);
      if (!validacionBool)
        throw new BadRequestException({ message: 'Validar testigo', id: id });

      let ordenes: Orden[] = [];
      let subtotalDeOrdenes: number = 0.0;

      const ordenesIds = ordenesDeServicioIds;
      for (const ordenId of ordenesIds) {
        const orden = await this.ordenRepository.findOneBy({ id: ordenId });
        if (!orden)
          throw new NotFoundException({
            message: `La orden con el Id ${ordenId} no se encuentra`,
            id: id,
          });
        if(orden.estatus != EstatusOrdenDeServicio.ACTIVA) throw new BadRequestException('Solo de pueden agregar ') 
        subtotalDeOrdenes = orden.subtotal + subtotalDeOrdenes;
        ordenes.push(orden);
      }

      const proveedor = await this.proveedrRepository.findOneBy({
        id: proveedorId,
      });
      if (!proveedor)
        throw new NotFoundException({
          message: 'No se encuentra el proveedor',
          id: id,
        });

      const facturaXmlData = await this.obtenerDatosDeArchivoXML(xml);

      if (proveedor.rfc !== facturaXmlData.rfc)
        throw new BadRequestException({
          message: 'RFC de la factura y RFC del proveedor no coinciden',
          id: id,
        });

      if (subtotalDeOrdenes != facturaXmlData.subtotal)
        throw new BadRequestException({
          message: `El monto de las ordenes y el subtotal de la factura no coinciden monto total de ordenes: ${subtotalDeOrdenes}, total de factura ${facturaXmlData.subtotal}`,
          id: id,
        });

      const factura = this.facturaRepository.create({
        id: id,
        ordenesDeServicio: ordenes,
        proveedor: proveedor,
        xml: xml,
        subtotal: facturaXmlData.subtotal,
        iva: facturaXmlData.iva,
        total: facturaXmlData.total,
        validacionTestigo: validacionBool,
        usuarioTestigo:usuarioTestigo,
        ...rest,
      });

      await this.facturaRepository.save(factura);
      return factura;
    } catch (error) {
      //await this.eliminarArchivoDeFactura(error.id);
      handleExeptions(error);
    }
  }

  async findAllBusqueda() {
    try {
      const facturas = await this.facturaRepository.find({
        relations: {
          proveedor: true,
        },
      });
      const facturasFilter = facturas.map((factura) => {
        return {
          id: factura.id,
          total: factura.total,
          estatus: factura.estatus,
          proveedor: {
            nombre: factura.proveedor.razonSocial,
            rfc: factura.proveedor.rfc,
          },
        };
      });
      return facturasFilter;
    } catch (error) {
      handleExeptions(error);
    }
  }

  async findAll(pagina: number) {
    try {
      const paginationSetter = new PaginationSetter();
      const facturas = await this.facturaRepository.find({
        take: paginationSetter.castPaginationLimit(),
        skip: paginationSetter.getSkipElements(pagina),
        relations: {
          proveedor: true,
        },
      });
      const facturasFilter = facturas.map((factura) => {
        return {
          id: factura.id,
          total: factura.total,
          estatus: factura.estatus,
          proveedor: {
            nombre: factura.proveedor.razonSocial,
            rfc: factura.proveedor.rfc,
          },
        };
      });
      return facturasFilter;
    } catch (error: any) {
      handleExeptions(error);
    }
  }

  async findOne(id: string) {
    try {
      const factura = await this.facturaRepository.findOne({
        where: { id: id },
        relations: {
          proveedor: true,
          ordenesDeServicio: true,
        },
      });
      return factura;
    } catch (error: any) {
      handleExeptions(error);
    }
  }

  async remove(id: string) {
    try {
      const factura = await this.findOne(id);
      if (factura) {
      }
    } catch (error: any) {
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
        subtotal: Number(subtotal),
        total: Number(total),
        iva: Number(iva),
        conceptos: conceptosPrecargados,
      };
    } catch (error) {
      handleExeptions(error);
      throw new Error('Error al procesar el archivo XML');
    }
  }

  //Funcion Para descargar los archivos xml y pdf  de filesystem
  async obtenerArchivosDescarga(id: string, tipoArchivo: string) {
    try {
      const factura = await this.facturaRepository.findOneBy({ id: id });
      if (!factura) throw new BadRequestException('No se encuentra la factura');
      if (tipoArchivo != 'xml' && tipoArchivo != 'pdf')
        throw new BadRequestException('Archivo no admitido');
      const rutaDeArchivo = tipoArchivo === 'xml' ? factura.xml : factura.pdf;

      const pathArchivo = path.join(this.rutaDeCarga, rutaDeArchivo);
      if (!fs.existsSync(pathArchivo))
        throw new BadRequestException('No se encontro el archivo');
      return pathArchivo;
    } catch (error) {
      handleExeptions(error);
    }
  }

  //Elimina los archivos de la factura en filesystem
  async eliminarArchivoDeFactura(id: string) {
    try {
      const pdf = path.join(
        this.rutaDeCarga,
        'static/uploads/pdf/',
        `${id}.pdf`,
      );
      const xml = path.join(
        this.rutaDeCarga,
        'static/uploads/xml/',
        `${id}.xml`,
      );
      if (!fs.existsSync(pdf))
        throw new BadRequestException('archivo pdf no encontrado');
      if (fs.existsSync(xml))
        throw new BadRequestException('archivo xml no encontrado');

      fs.unlinkSync(pdf);
      fs.unlinkSync(xml);

      return {
        message: 'Archivos xml y pdf de la factura eliminados exitosamente',
        value: true,
      };
    } catch (error) {
      handleExeptions(error);
    }
  }

  //Canela la factura ingresada
  async cancelarFactura(id: string, updateFacturaDto: UpdateFacturaDto) {
    try {
      const { motivoDeCancelacion } = updateFacturaDto;
      const factura = await this.facturaRepository.findOneBy({ id: id });
      if (!factura) throw new NotFoundException('Factura no encontrada');
      if (!motivoDeCancelacion)
        throw new BadRequestException(
          'Se debe de incluir el motivo de cancelación',
        );

      factura.motivoCancelacion = motivoDeCancelacion;
      const { message, value } = await this.eliminarArchivoDeFactura(id);

      if (value) {
        await this.facturaRepository.save(factura);
        return { message: `Factura cancelada correctamente, ${message}` };
      }
    } catch (error) {
      handleExeptions(error);
    }
  }

  async actualizarEstatusDeFactura(id: string, estatus: EstatusFactura) {
    try {
      const factura = await this.facturaRepository.findOneBy({ id: id });
      if (!factura) throw new NotFoundException('No se encontro la factura');
      factura.estatus = estatus;
      await this.facturaRepository.update(id, factura);
      return { message: 'estatus de factura actualizado' };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerEstatusDeFactura(id) {
    try {
      const factura = await this.facturaRepository.findOneBy(id);
      if (!factura) throw new NotFoundException('No se encontro la factura');
      return {
        id: factura.id,
        estatus: factura.estatus,
      };
    } catch (error) {
      handleExeptions(error);
    }
  }

  async obtenerDocumentoDeFacturaPdf(id: string) {
    try {
      const documento = await this.firmaService.descargarDocumento(id,TipoDeDocumento.APROBACION_DE_FACTURA);
      return documento;
    } catch (error) {
      handleExeptions(error);
    }
  }
  
  async mandarFacturaAFirmar(facturaId:string){
    const docuemntoFirmaDto:CreateFirmaDto = {
      ordenOFacturaId:facturaId,
      tipoDeDocumento:TipoDeDocumento.APROBACION_DE_FACTURA,
      estaFirmado:false,
    }
    return await this.firmaService.create(docuemntoFirmaDto);
  }

  /*
  async cotejarFactura(usuario:Usuario, facturaId:string){
    const documentoFirmaDto:CreateFirmaDto = {
      ordenOFacturaId:facturaId,
      tipoDeDocumento:TipoDeDocumento.APROBACION_DE_FACTURA,
      estaFirmado:false,
    }
    const documentoFirma = (await this.firmaService.create(documentoFirmaDto)).documentoAFirmar;
    const linkDeFacturaACotejar = await this.firmaService.firmarDocumento(usuario.id,documentoFirma.id);
    const factura = await this.facturaRepository.findOneBy({id:facturaId});
    factura.usuarioTestigo = usuario;
    await this.facturaRepository.save(factura);
    return linkDeFacturaACotejar;
  }*/

}
