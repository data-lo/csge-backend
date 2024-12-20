import { Content } from 'pdfmake/interfaces';

export const facturarAOrdenSection = (): Content[] => {
  const facturar: Content = {
    text: 'FACTURAR: ',
    bold: true,
    font:'Poppins',
    fontSize: 12,
    marginBottom: 5,
    marginTop: 10,
  };

  const facturacionGobierno: Content = {
    text: 'GOBIERNO DEL ESTADO DE CHIHUAHUA \n VENUSTIANO CARRANZA NO. 601, C.P. 31350 \n GEC-981004-RE5',
    fontSize: 12,
    marginBottom: 5,
    font:'Poppins'
  };

  return [facturar, facturacionGobierno];
};
