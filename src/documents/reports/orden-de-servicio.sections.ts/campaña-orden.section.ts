import { Content } from "pdfmake/interfaces";

interface CampañaOptions {
    nombre:string
}

export const campañaOrdenSection = (campaña:CampañaOptions):Content => {

    let text: string = null;
    text = campaña.nombre ? `CAMPAÑA: ${campaña.nombre}` : 'GENERAL'
    
    const nombreCampaña:Content = {
        text:text,
        fontSize:24,
        color:'#0336a0',
        marginBottom:10,
        alignment:'center',
        italics:true
    }
    
    return nombreCampaña;
}