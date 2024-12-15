import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Factura } from "src/ordenes/factura/entities/factura.entity";
import { footerSection } from "./sections/footer.section";
import { headerSection } from "./sections/header.section";
import { textoDeRecepcionSection } from "./aprobacion-de-factura-sections/texto-de-recepcion-section";
import { tablaDeProveedorSection } from "./aprobacion-de-factura-sections/tabla-de-proveedor-section";
import { firmasDeRecepcionSection } from "./aprobacion-de-factura-sections/firmas-de-recepcion-section";
import { notaDeFacturaSection } from "./aprobacion-de-factura-sections/nota-de-factura-section";


interface AprobacionDeFacturaOptions {
    facturaDb:Factura,
    textoEncabezado:string,
    textoPieDePagina:string,
}

export const aprobacionDeFacturaPdf = async (factura: AprobacionDeFacturaOptions) => {

    const {
        proveedor,
        total,
        folio,
    } = factura.facturaDb;

    const textoDeRecepcion = `RECIBÍ DE LA OFICINA DE SERVICIOS ADMINISTRATIVOS DE LA COORDINACIÓN DE COMUNICACIÓN
    FACTURAS ORIGINALES PARA SU REVISIÓN Y AUTORIZACIÓN
    (ANEXAR OFICIOS DE DEPENDENCIAS DESCENTRALIZADAS A LAS FACTURAS QUE CORRESPONDAN)`;
    const notaDeRecepcion = `LOS TESTIGOS DE LAS PRESENTE(S) FACTURA(S) SERÁN ENTREGADOS Y REVISADOS DE MANERA DIGITAL`;
    const textoEncabezado = factura.textoEncabezado;
    const textoPieDePagina = factura.textoPieDePagina;
    const presupuestoText = 'PRESUPUESTO 2025';
    
    const {footerTextPieDePaginaC, presupuestoTextC} = footerSection({textoPieDePagina, presupuestoText});

    const docDefinition: TDocumentDefinitions = {
        info:{
            creationDate: new Date(),
            author:
                'COORDINACIÓN DE COMUNICACIÓN DE GOBIERNO DEL ESTADO DE CHIHUAHUA',
            title: `RECEPCIÓN DE FACTURA: ${folio}`,
        },
        pageSize:'LETTER',
        pageMargins:[30,120,30,60],
        footer: function(currentPage, pageCount){
            return {
                columns:[
                    {
                        width:'*',
                        stack:[presupuestoTextC]
                    },
                    {
                        width:'*',
                        stack:[footerTextPieDePaginaC]
                    },
                    {
                        stack:[
                            {
                                width:'auto',
                                alignment:'right',
                                font:'Poppins',
                                marginRight:30,
                                bold:true,
                                stack:[currentPage.toString() + ' de ' + pageCount],
                            },
                        ]
                    },
                ]
            }
        },
        header: await headerSection({
            showLogo:true,
            showTitle:true,
            textoEncabezado:textoEncabezado,
            folio:folio
        }),
        content: [
            textoDeRecepcionSection(textoDeRecepcion),
            tablaDeProveedorSection(proveedor.razonSocial,folio,total),
            firmasDeRecepcionSection(),
            notaDeFacturaSection(notaDeRecepcion)      
        ],
    };
    return docDefinition;
}