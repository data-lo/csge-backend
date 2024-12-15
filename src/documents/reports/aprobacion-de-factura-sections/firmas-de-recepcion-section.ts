import { Content } from "pdfmake/interfaces";

export const firmasDeRecepcionSection = ():Content => {
    
    const style = {
        font:'Poppins',
        bold:true,
        fontSize:8,
    }
    
    const firmasDeRecepcionC:Content = {
        style,
        alignment:'center',
        layout:'lightHorizontalLines',
        table:{
            widths:['*'],
            heights:[30],
            body:[
                    [
                        {text:''}
                    ],
                    [
                        {text:'', style}
                    ]
                ]
        }
    }
    
    return firmasDeRecepcionC;
}