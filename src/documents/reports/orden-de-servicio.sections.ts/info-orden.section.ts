import { Content } from "pdfmake/interfaces";

interface informacionOrdenData {
    folio:string,
    fechaDeEmision:Date,
    fechaDeAprobacion:Date
}


export const informacionOrdenSection = (ordenInfo:informacionOrdenData):Content[] => {

    const title:Content = {
        text:'INFORMACIÓN DE LA ORDEN',
        bold:true,
        fontSize:12,
        marginBottom:5,
        font:'Poppins'
    }

    const folio:Content = {
        text:`FOLIO: ${ordenInfo.folio}`,
        font:'Poppins',
    }

    const fechaDeEmision:Content = {
        text:`FECHA DE EMISIÓN: ${ordenInfo.fechaDeEmision}`,
        font:'Poppins',
    }

    return [
        title,
        folio,
        fechaDeEmision,
    ]
}