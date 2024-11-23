import { Content } from "pdfmake/interfaces";
import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";

export const tipoOrdenSection = (tipoDeServicio:TipoDeServicio):Content[] => {
    
    const title:Content = {
        text:'ORDEN DE SERVICIO',
        alignment:'center',
        bold:true,
        fontSize: 22,
    }
    
    const tipoDeOrdenContent:Content = {
        text:tipoDeServicio,
        alignment:'center',
        fontSize:18,
        marginBottom:10
    }

    return [
        title,
        tipoDeOrdenContent
    ]    
}