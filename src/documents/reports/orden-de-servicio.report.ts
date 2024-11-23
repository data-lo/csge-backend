import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { headerSection } from './sections/header.section';

interface OrdenDeServicioOptions {
  ordenDeServicio: Orden;
}

export const ordenDeServicioPdf = async (orden: OrdenDeServicioOptions) => {
    
    const {campaña,proveedor,...rest} = orden.ordenDeServicio;
    const docDefinition: TDocumentDefinitions = {
    header: await headerSection({
      showLogo: true,
      showTitle: true,
    }),
    content: [
        {
            text:`ORDEN DE SERVICIO: ${rest.tipoDeServicio}`,
             
        }
    ],
  };
  return docDefinition;
};
