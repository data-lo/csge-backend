import { Content } from "pdfmake/interfaces";

export const firmasDeRecepcionSection = ():Content => {
    
    const style = {
        font:'Poppins',
        bold:true,
        fontSize:8,
    }
    
    const firmasDeRecepcionC:Content = {
        style,
        alignment:'left',
        layout:'lightHorizontalLines',
        table:{
            widths:['auto'],
            body:[
                [
                    {text:''}
                ],
                [
                    {text:'FIRMA DE APROBACIÓN', style}
                ]
            ]
        }
    }
    
    return firmasDeRecepcionC;
}