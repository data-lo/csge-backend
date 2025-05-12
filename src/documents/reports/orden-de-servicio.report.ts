import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Orden } from 'src/ordenes/orden/entities/orden.entity';
import { headerSection } from './sections/header.section';
import { tipoOrdenSection } from './orden-de-servicio-sections/tipo-orden.section';
import {
  campañaOrdenSection,
  informacionOrdenSection,
  montosTotalesOrdenSection,
  proveedorOrdenSection,
} from './orden-de-servicio-sections';
import { footerSection } from './sections/footer.section';
import { facturarAOrdenSection } from './orden-de-servicio-sections/facturar-a.-ordensection';
import { serviciosContratadosSection } from './orden-de-servicio-sections/servicios-contratados.section';
import { TextoPlazoPagoSection } from './orden-de-servicio-sections/texto-plazo-pago.section';
import { firmasDeRecepcionSection } from './aprobacion-de-factura-sections/firmas-de-recepcion-section';
import { handleExceptions } from 'src/helpers/handleExceptions.function';
import { SIGNATURE_ACTION_ENUM } from 'src/firma/firma/enums/signature-action-enum';


interface Props {
  ordenDeServicio: Orden;
  signatureAction?: SIGNATURE_ACTION_ENUM
  textoEncabezado: string;
  textoPieDePagina: string;
  qrCode?: string;
  actionType: string;
}

export const ordenDeServicioPdf = async (orden: Props) => {
  try {
    const {
      campaña,
      proveedor,
      serviciosContratados,
      tipoDeServicio,
      folio,
      fechaDeAprobacion,
      fechaDeEmision,
      subtotal,
      iva,
      total,
      contratoMaestro,
    } = orden.ordenDeServicio;

    const { razonSocial, rfc, tipoProveedor, domicilioFiscal } = proveedor;

    const textoEncabezado = orden.textoEncabezado;
    const textoPieDePagina = orden.textoPieDePagina;
    const presupuestoText = 'PRESUPUESTO 2025';

    const { footerTextPieDePaginaC, presupuestoTextC } = footerSection({
      textoPieDePagina,
      presupuestoText,
    });

    const docDefinition: TDocumentDefinitions = {
      info: {
        creationDate: new Date(),
        author:
          'COORDINACIÓN DE COMUNICACIÓN DE GOBIERNO DEL ESTADO DE CHIHUAHUA',
        title: `ORDEN DE SERVICIO ${folio}`,
      },

      pageSize: 'LETTER',
      pageMargins: [30, 120, 30, 60],
      footer: function (currentPage, pageCount) {
        return {
          columns: [
            { width: '*', stack: [presupuestoTextC] },
            { width: '*', stack: [footerTextPieDePaginaC] },
            {
              stack: [
                {
                  width: 'auto',
                  font: 'Poppins',
                  alignment: 'right',
                  marginRight: 30,
                  bold: true,
                  stack: [currentPage.toString() + ' de ' + pageCount],
                },
              ],
            },
          ],
        };
      },

      header: await headerSection({
        showLogo: true,
        showTitle: true,
        textoEncabezado: textoEncabezado,
        folio: `FOLIO DE LA ORDEN: ${folio}`,
      }),

      content: [
        {
          columns: [
            {
              width: '*',
              alignment: 'right',
              stack: [firmasDeRecepcionSection(orden.actionType)],
            },
          ],
        },
        tipoOrdenSection(tipoDeServicio),
        campañaOrdenSection(campaña),
        {
          columns: [
            [
              proveedorOrdenSection({
                razonSocial,
                rfc,
                tipoProveedor,
                domicilioFiscal,
                contratoMaestro,
              }),
            ],
            [
              informacionOrdenSection({
                folio,
                fechaDeEmision,
                fechaDeAprobacion,
              }),
              facturarAOrdenSection(),
            ],
          ],
        },
        {
          marginBottom: 5,
          stack: [serviciosContratadosSection({ serviciosContratados })],
        },
        {
          columns: [
            {
              width: '*',
              alignment: 'left',
              stack: [TextoPlazoPagoSection(10)],
            },
            {
              width: 'auto',
              stack: [montosTotalesOrdenSection({ 
                subtotal: Number(subtotal), 
                iva: Number(iva), 
                total: Number(total) 
            })]
            
            },
          ],
        },
        orden.qrCode
        ? {
            alignment: 'left',
            margin: [0, 20],
            image: orden.qrCode,
            width: 100,
          }
        : undefined,
      ],
    };

    return docDefinition;
  } catch (error) {
    handleExceptions(error);
  }
};
