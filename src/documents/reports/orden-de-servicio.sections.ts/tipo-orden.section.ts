import { Content } from 'pdfmake/interfaces';
import { TipoDeServicio } from 'src/contratos/interfaces/tipo-de-servicio';

export const tipoOrdenSection = (
  tipoDeServicio: TipoDeServicio,
): Content[] => {
  
  const tipoDeOrdenContent: Content = {
    text: `ORDEN DE SERVICIO: ${tipoDeServicio}`,
    alignment: 'center',
    font:'Poppins',
    fontSize: 14,
    bold:true
  };

  return [tipoDeOrdenContent];
};
