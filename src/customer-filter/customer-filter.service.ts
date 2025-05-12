import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Contrato } from 'src/contratos/contratos/entities/contrato.entity';
import { ContratoMaestro } from 'src/contratos/contratos/entities/contrato.maestro.entity';
import { ContratoModificatorio } from 'src/contratos/contratos_modificatorios/entities/contratos_modificatorio.entity';
import { Proveedor } from 'src/proveedores/proveedor/entities/proveedor.entity';
import { DataSource, Repository } from 'typeorm';
import { formatPropertyName } from './functions/format-property-name';
import { formatNameToUpper } from './functions/format-name-to-upper';
import { MODULE_ENUM } from './enums/module-enum';
import { Estacion } from 'src/proveedores/estacion/entities/estacion.entity';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { Campaña } from 'src/campañas/campañas/entities/campaña.entity';
import { CreateQueryDto } from './entities/customer-filter.entity';
import { normalizePath } from './functions/normalize-path';
import { Factura } from 'src/ordenes/factura/entities/factura.entity';
import * as XLSX from "xlsx";
import { Response } from "express";

@Injectable()
export class CustomReportService {

  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Contrato)
    private contractRepository: Repository<Contrato>,

    @InjectRepository(Proveedor)
    private readonly providerRepository: Repository<Proveedor>,

    @InjectRepository(ContratoMaestro)
    private readonly masterContractRepository: Repository<ContratoMaestro>,

    @InjectRepository(ContratoModificatorio)
    private readonly amendmentContractRepository: Repository<ContratoModificatorio>,

    @InjectRepository(Factura)
    private readonly invoiceRepository: Repository<Factura>,

    @InjectRepository(Orden)
    private readonly orderRepository: Repository<Orden>,

    @InjectRepository(Campaña)
    private readonly campaignRepository: Repository<Campaña>,
  ) { }

  private readonly entityMap = {
    [MODULE_ENUM.MASTER_CONTRACT]: ContratoMaestro,
    [MODULE_ENUM.PROVIDER]: Proveedor,
    [MODULE_ENUM.INVOICE]: Factura,
    [MODULE_ENUM.AMMENDMENT_CONTRACT]: ContratoModificatorio,
    [MODULE_ENUM.STATION]: Estacion,
    [MODULE_ENUM.ORDER]: Orden,
    [MODULE_ENUM.CAMPAIGN]: Campaña,
  };

  getMetadataByModule(module: string) {
    const entity = this.entityMap[module];

    if (!entity) {
      throw new BadRequestException(`¡No se encontró ninguna entidad para el módulo: ${module}!`);
    }

    const metadata = this.dataSource.getMetadata(entity);

    const fields = metadata.columns.map(col => ({
      name: formatNameToUpper(col.propertyName),
      type: col.type,
      isRelation: !!metadata.findRelationWithPropertyPath(col.propertyName),
    }));

    const relations = metadata.relations.map(rel => ({
      name: formatPropertyName(rel.propertyName),
      property: rel.propertyName,
      type: rel.relationType,
      target: rel.type,
      inverseSide: rel.inverseSidePropertyPath,
    }));


    return { fields, relations };

  }

  async buildQuery(dto: CreateQueryDto) {
    const { entity, relations } = dto;
  
    const entityClass = this.entityMap[entity.toUpperCase()];
    if (!entityClass) {
      throw new Error(`Entidad no encontrada: ${entity}`);
    }
  
    const rootAlias = normalizePath(entity); // ej: campaña
    let query = this.dataSource.createQueryBuilder(entityClass, rootAlias);
  
    const usedJoins = new Set<string>();
  
    for (const path of relations) {
      const segments = path.split(".");
  
      if (segments.length < 2) continue;
  
      let joinPath = normalizePath(segments[0]);
      let fullPath = joinPath;
  
      for (let i = 1; i < segments.length; i++) {
        const segment = normalizePath(segments[i]);
        fullPath += `.${segment}`;
  
        if (!usedJoins.has(fullPath)) {
          const alias = fullPath.replace(/\./g, "_");
          query = query.leftJoinAndSelect(fullPath, alias);
          usedJoins.add(fullPath);
        }
      }
    }
  
    const result = await query.getRawMany();

    console.log(result)
  
    return result;
  }
  
  
  async getCustomReport(dto: CreateQueryDto, res: Response) {

    const data = await this.buildQuery(dto);
  
    if (!data.length) {
      throw new Error('No se encontraron datos para exportar.');
    }
  
    const worksheet = XLSX.utils.json_to_sheet(data);
  
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');
  
    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });
  
    res.setHeader('Content-Disposition', 'attachment; filename="reporte.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
    res.send(buffer);
  }
  
  
}
