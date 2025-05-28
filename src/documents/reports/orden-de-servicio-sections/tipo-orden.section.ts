import { Content } from 'pdfmake/interfaces';
import { TIPO_DE_SERVICIO } from 'src/contratos/interfaces/tipo-de-servicio';

export const tipoOrdenSection = (
  TIPO_DE_SERVICIO: TIPO_DE_SERVICIO,
): Content[] => {
  
  const tipoDeOrdenContent: Content = {
    text: `ORDEN DE SERVICIO (ESTE DOCUMENTO NO CUENTA CON VÁLIDEZ OFICIAL): ${TIPO_DE_SERVICIO}`,
    alignment: 'center',
    font:'Poppins',
    fontSize: 14,
    bold:true
  };

  return [tipoDeOrdenContent];
};
