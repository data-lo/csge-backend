import { Content } from "pdfmake/interfaces";

interface CampañaOptions {
    nombre:string
}

export const campañaOrdenSection = (campaña:CampañaOptions):Content => {

    let text: string = null;
    text = campaña.nombre ? `CAMPAÑA: ${campaña.nombre}` : 'GENERAL'
    
    const style = {
        font:'Poppins',
        fontSize:14,
        bold:true,
        color:'#0336a0'
    }

    const nombreCampaña:Content = {
        text:text,
        marginBottom:10,
        alignment:'center',
        style
    }
    
    return nombreCampaña;
}