import { Content } from 'pdfmake/interfaces';
export const montosTotalesOrdenSection = (totales: Totales): Content => {
    const style = {
        font: 'Poppins',
        fontSize: 14,
        bold: true,
    };

    const totalesC: Content = {
        style,
        alignment: 'right',
        layout: 'lightHorizontalLines',
        table: {
            widths: ['auto'],
            body: [
                [
                    {
                        text: `SUBTOTAL: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totales.subtotal)}`,
                    },
                ],
                [
                    {
                        text: `IVA: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totales.iva)}`,
                    },
                ],
                [
                    {
                        text: `TOTAL: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totales.total)}`,
                        fontSize: 16,
                        bold: true,
                    },
                ],
            ],
        },
    };

    return totalesC;
};

interface Totales {
    subtotal: number;
    iva: number;
    total: number;
}
