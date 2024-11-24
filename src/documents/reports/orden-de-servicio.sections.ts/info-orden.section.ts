import { date } from "joi";
import { Content } from "pdfmake/interfaces";
import { DateFormatter } from "src/helpers/dateFormatter";

interface informacionOrdenData {
    folio:string,
    fechaDeEmision:Date,
    fechaDeAprobacion:Date
}


export const informacionOrdenSection = (ordenInfo:informacionOrdenData):Content[] => {

    const folio:Content = {
        text:ordenInfo.folio
    }

    const fechaDeEmision:Content = {
        text:`FECHA DE EMISIÓN DE LA ORDEN:${ordenInfo.fechaDeEmision}`
    }

    const fechaDeAprobacion:Content = {
        text: `FECHA DE APROBACIÓN DE LA ORDEN:${ordenInfo.fechaDeAprobacion}`
    }

    return [
        folio,
        fechaDeEmision,
        fechaDeAprobacion
    ]
}