import { Content } from "pdfmake/interfaces";

export const firmasDeRecepcionSection = ():Content => {
    
    const style = {
        font:'Poppins',
        bold:true,
        fontSize:8,
    }
    
    const firmasDeRecepcionC:Content = {
        style,
        text:''
    }
    
    return firmasDeRecepcionC;
}