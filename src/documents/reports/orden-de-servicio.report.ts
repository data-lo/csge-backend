import { TDocumentDefinitions } from "pdfmake/interfaces";
import { Orden } from "src/ordenes/orden/entities/orden.entity";

interface OrdenDeServicioOptions {
    ordenDeServicio: Orden,
}

export const ordenDeServicioPdf = (orden:OrdenDeServicioOptions):TDocumentDefinitions => {
    const docDefinition: TDocumentDefinitions = {
        content: [`${orden}`],
    };
    return docDefinition;
}