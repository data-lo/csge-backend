import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Factura } from "src/ordenes/factura/entities/factura.entity";


interface AprobacionDeFacturaOptions {
    facturaDb:Factura,
    textoEncabezado:string,
    textoPieDePagina:string,
}

export const aprobacionDeFacturaPdf = (factura: AprobacionDeFacturaOptions):TDocumentDefinitions => {

    const {
        
    } = factura.facturaDb;

    const docDefinition: TDocumentDefinitions = {
        content: ['Factura Pdf'],
    };
    return docDefinition;
}