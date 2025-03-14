import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Factura } from "src/ordenes/factura/entities/factura.entity";
import { footerSection } from "./sections/footer.section";
import { headerSection } from "./sections/header.section";
import { textoDeRecepcionSection } from "./aprobacion-de-factura-sections/texto-de-recepcion-section";
import { tablaDeProveedorSection } from "./aprobacion-de-factura-sections/tabla-de-proveedor-section";
import { firmasDeRecepcionSection } from "./aprobacion-de-factura-sections/firmas-de-recepcion-section";
import { notaDeFacturaSection } from "./aprobacion-de-factura-sections/nota-de-factura-section";
import { Campaña } from "src/campañas/campañas/entities/campaña.entity";


interface Props {
    campaing: Campaña
    header: string,
    footer: string,
}

export const campaignApprovalStructure = async (data: Props) => {
    const description = `ESTE DOCUMENTO CERTIFICA LA AUTORIZACIÓN Y APROBACIÓN DE LA CAMPAÑA, PERMITIENDO EL USO DE LOS RECURSOS ASOCIADOS.`;
    const budget = 'PRESUPUESTO 2025';

    const { footerTextPieDePaginaC, presupuestoTextC } = footerSection({ textoPieDePagina: data.footer, presupuestoText: budget });

    const documentDefinition: TDocumentDefinitions = {
        info: {
            creationDate: new Date(),
            author:
                'COORDINACIÓN DE COMUNICACIÓN DE GOBIERNO DEL ESTADO DE CHIHUAHUA',
            title: `APROBACIÓN DE CAMPAÑA: ${data}`,
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
            textoEncabezado: data.header,
            folio: `CAMPAÑA: ${data.campaing.nombre}`
        }),
        content: [
            textoDeRecepcionSection(description),
            firmasDeRecepcionSection(),
        ],
    };
    return documentDefinition;
}