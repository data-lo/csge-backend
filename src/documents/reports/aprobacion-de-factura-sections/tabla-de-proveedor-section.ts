import { Content } from 'pdfmake/interfaces';

export const tablaDeProveedorSection = (
  razonSocialProveedor: string,
  folio: string,
  total: number,
): Content => {
  const style = {
    font: 'Poppins',
    fontSize: 12,
    bold: true,
  };

  const tablaDeProveedorSectionC: Content = {
    style,
    layout: 'lightHorizontalLines',
    table: {
      widths: ['auto', 'auto', '*'],
      headerRows: 1,
      body: [
        [
          { alignment: 'left', text: 'PROVEEDOR' },
          { alignment: 'center',text: 'NÚMERO DE FACTURA\n(FOLIO)' },
          { alignment: 'right',text: 'IMPORTE' },
        ],
        [
          { alignment: 'left', text: `${razonSocialProveedor.toUpperCase()}` },
          { alignment: 'center', text: `${folio}` },
          {
            alignment: 'right',
            text: `${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(total)}`,
          },
        ],
      ],
    },
  };

  return tablaDeProveedorSectionC;
};
