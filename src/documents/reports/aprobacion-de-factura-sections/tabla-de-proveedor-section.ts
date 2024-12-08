
import { Content } from "pdfmake/interfaces";

export const tablaDeProveedorSection = (razonSocialProveedor:string, folio:string, total:number):Content => {
    
    
    const style = {
        font: 'Poppins',
        fontSize: 14,
        bold:true,
    }

    const tablaDeProveedorSectionC:Content = {
        style,
        layout:'lightHorizontalLines',
        table:{
            widths:['auto','auto','auto'],
            headerRows:1,
            body:[
                ['PROVEEDOR','NÚMERO DE FACTURA (FOLIO)','IMPORTE'],
                [
                {text:`${razonSocialProveedor.toUpperCase()}`},
                {text:`${folio}`},
                {text:`${new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(total)}`},    
                ]
            ],
        }
    }

    
    return tablaDeProveedorSectionC; 
}