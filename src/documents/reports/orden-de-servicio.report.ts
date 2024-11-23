import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { headerSection } from './sections/header.section';
import { tipoOrdenSection } from './orden-de-servicio.sections.ts/tipo-orden.section';
import { campañaOrdenSection } from './orden-de-servicio.sections.ts';

interface OrdenDeServicioOptions {
  ordenDeServicio: Orden;
}

export const ordenDeServicioPdf = async (orden: OrdenDeServicioOptions) => {
    console.log(orden);
  const { campaña, proveedor, serviciosContratados, tipoDeServicio, ...rest } =
    orden.ordenDeServicio;

  const docDefinition: TDocumentDefinitions = {
    pageSize:'LETTER',
    pageMargins:[40,120,40,40],
    header: await headerSection({
      showLogo: true,
      showTitle: true,
    }),
    content: [
        campañaOrdenSection(campaña),
        tipoOrdenSection(tipoDeServicio),
    ],
    
  };
  return docDefinition;
};
