import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Factura } from "src/ordenes/factura/entities/factura.entity";
import { footerSection } from "./sections/footer.section";
import { headerSection } from "./sections/header.section";
import { textoDeRecepcionSection } from "./aprobacion-de-factura-sections/texto-de-recepcion-section";
import { tablaDeProveedorSection } from "./aprobacion-de-factura-sections/tabla-de-proveedor-section";
import { firmasDeRecepcionSection } from "./aprobacion-de-factura-sections/firmas-de-recepcion-section";
import { SIGNATURE_ACTION_ENUM } from "src/firma/firma/enums/signature-action-enum";


interface Props {
    invoice: Factura,
    textoEncabezado: string,
    textoPieDePagina: string,
}

export const invoiceCancellationReport = async (invoice: Props) => {

    const {
        proveedor,
        total,
        folio,
    } = invoice.invoice;


    const textoEncabezado = invoice.textoEncabezado;
    const textoPieDePagina = invoice.textoPieDePagina;

    const textoDeRecepcion = `
        LA OFICINA DE SERVICIOS ADMINISTRATIVOS DE LA COORDINACIÓN DE COMUNICACIÓN
        INFORMA LA CANCELACIÓN DE LA PRESENTE FACTURA, ASÍ COMO DE LAS ÓRDENES ADJUNTAS.
        (SE DEBEN ANEXAR LOS OFICIOS DE LAS DEPENDENCIAS DESCENTRALIZADAS A LAS FACTURAS CORRESPONDIENTES)
    `;

    const presupuestoText = 'PRESUPUESTO 2025';

    const { footerTextPieDePaginaC, presupuestoTextC } = footerSection({ textoPieDePagina, presupuestoText });

    const docDefinition: TDocumentDefinitions = {
        info: {
            creationDate: new Date(),
            author:
                'COORDINACIÓN DE COMUNICACIÓN DE GOBIERNO DEL ESTADO DE CHIHUAHUA',
            title: `CANCELACIÓN DE FACTURA: ${folio}`,
        },
        pageSize: 'LETTER',
        pageMargins: [30, 120, 30, 60],
        footer: function (currentPage, pageCount) {
            return {
                columns: [
                    {
                        width: '*',
                        stack: [presupuestoTextC]
                    },
                    {
                        width: '*',
                        stack: [footerTextPieDePaginaC]
                    },
                    {
                        stack: [
                            {
                                width: 'auto',
                                alignment: 'right',
                                font: 'Poppins',
                                marginRight: 30,
                                bold: true,
                                stack: [currentPage.toString() + ' de ' + pageCount],
                            },
                        ]
                    },
                ]
            }
        },
        header: await headerSection({
            showLogo: true,
            showTitle: true,
            textoEncabezado: textoEncabezado,
            folio: `FOLIO DE LA FACTURA: ${folio}`
        }),
        content: [
            textoDeRecepcionSection(textoDeRecepcion),
            tablaDeProveedorSection(proveedor.razonSocial, folio, total),
            firmasDeRecepcionSection(SIGNATURE_ACTION_ENUM.CANCEL),
        ],
    };
    return docDefinition;
}