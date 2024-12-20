import { Content } from "pdfmake/interfaces";

export const TextoPlazoPagoSection = (dias:number):Content => {

    const textoPlazoPago:Content = {
        font:'Poppins',
        bold:true,
        fontSize:10,
        text:`ESTA ORDEN SE DEBERÁ PRESENTAR PARA 
        EL TRÁMITE DE PAGO EN UN PLAZO NO MAYOR A ${dias}
        DÍAS DESPUÉS DE LA FECHA FINAL DE PUBLICACIÓN
        `
    }
    return textoPlazoPago
}