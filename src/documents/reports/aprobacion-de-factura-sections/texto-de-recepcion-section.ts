import { Content } from "pdfmake/interfaces";

export const textoDeRecepcionSection = (textoDeRecepcion:string):Content => {
    
    const style = {
        font:'Poppins',
        fontSize:10,
        bold:true
    }
    
    const textoDeRecepcionC:Content = {
        text:textoDeRecepcion,
        marginBottom:10,
        alignment:'center',
        style
    }

    return textoDeRecepcionC;
}