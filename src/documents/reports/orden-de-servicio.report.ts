import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { headerSection } from './sections/header.section';
import { tipoOrdenSection } from './orden-de-servicio.sections.ts/tipo-orden.section';
import {
  campañaOrdenSection,
  informacionOrdenSection,
  proveedorOrdenSection,
} from './orden-de-servicio.sections.ts';

interface OrdenDeServicioOptions {
  ordenDeServicio: Orden;
}

export const ordenDeServicioPdf = async (orden: OrdenDeServicioOptions) => {
  console.log(orden);
  const {
    campaña,
    proveedor,
    serviciosContratados,
    tipoDeServicio,
    folio,
    contrato,
    fechaDeAprobacion,
    fechaDeEmision,
    ...rest
  } = orden.ordenDeServicio;

  const docDefinition: TDocumentDefinitions = {
    info:{
        creationDate:new Date(),
        author:'COORDINACIÓN DE COMUNICACIÓN SOCIAL DE GOBIERNO DEL ESTADO DE CHIHUAHUA',
        title:`ORDEN DE SERVICIO ${folio}`,
    },
    
    pageSize: 'LETTER',
    pageMargins: [40, 120, 40, 40],

    header: await headerSection({
      showLogo: true,
      showTitle: true,
    }),

    content: [
        campañaOrdenSection(campaña),
        tipoOrdenSection(tipoDeServicio),
        proveedorOrdenSection(proveedor),
        informacionOrdenSection({folio,fechaDeEmision,fechaDeAprobacion}),
    ],

    footer: [],
  };
  return docDefinition;
};
