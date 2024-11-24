import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { headerSection } from './sections/header.section';
import { tipoOrdenSection } from './orden-de-servicio.sections.ts/tipo-orden.section';
import {
  campañaOrdenSection,
  informacionOrdenSection,
  proveedorOrdenSection,
} from './orden-de-servicio.sections.ts';
import { footerPageSection, footerSection } from './sections/footer.section';
import { facturarAOrdenSection } from './orden-de-servicio.sections.ts/facturar-a.-ordensection';
import { serviciosContratadosSection } from './orden-de-servicio.sections.ts/servicios-contratados.section';

interface OrdenDeServicioOptions {
  ordenDeServicio: Orden;
  textoEncabezado: string;
  textoPieDePagina: string;
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

  console.log(serviciosContratados)
  const textoEncabezado = orden.textoEncabezado;
  const textoPieDePagina = orden.textoPieDePagina;
  const presupuestoText = 'PRESUPUESTO 2025';

  const docDefinition: TDocumentDefinitions = {
    info: {
      creationDate: new Date(),
      author:
        'COORDINACIÓN DE COMUNICACIÓN SOCIAL DE GOBIERNO DEL ESTADO DE CHIHUAHUA',
      title: `ORDEN DE SERVICIO ${folio}`,
    },
    pageSize: 'LETTER',
    pageMargins: [40, 120, 40, 20],

    header: await headerSection({
      showLogo: true,
      showTitle: true,
      textoEncabezado: textoEncabezado,
      folio:folio,
    }),

    footer:function(currentPage,pageCount){
      const footerTexts = footerSection({textoPieDePagina,presupuestoText});
      const footerPages = footerPageSection({currentPage,pageCount})
      return footerTexts.columns.push(footerPages);
    },
    
    content: [
      tipoOrdenSection(tipoDeServicio),
      campañaOrdenSection(campaña),
      {
        columns:[
          [proveedorOrdenSection(proveedor)],
          [
            informacionOrdenSection({ folio, fechaDeEmision, fechaDeAprobacion }),
            facturarAOrdenSection()
          ],
        ]
      },
      //serviciosContratadosSection({serviciosContratados})
    ],
  };
  return docDefinition;
};
