import { TDocumentDefinitions } from "pdfmake/interfaces";

export const aprobacionDeFacturaPdf = ():TDocumentDefinitions => {
    const docDefinition: TDocumentDefinitions = {
        content: ['Factura Pdf'],
    };
    return docDefinition;
}