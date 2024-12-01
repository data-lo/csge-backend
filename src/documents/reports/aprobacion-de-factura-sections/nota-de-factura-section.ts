import { Content } from "pdfmake/interfaces";

export const notaDeFacturaSection = (texto:string):Content => {

    const style  =  {
        font:'Poppins',
        fontSize:12,
    }

    const notaTitleDeFacturaSectionC:Content = {
        text:'NOTA',style,italics:true
    }
    const notaDeFacturaSectionC:Content = {
        text:texto,style,bold:true
    }
    
    return [notaTitleDeFacturaSectionC, notaDeFacturaSectionC] 
}