import { Content } from "pdfmake/interfaces"
import { Proveedor } from "src/proveedores/proveedor/entities/proveedor.entity"


export const proveedorOrdenSection = (proveedor:Proveedor):Content[] => {

    const style = {
        font:'Poppins',
        fontSize:12,
    }


    const titulo:Content =  {
        text:'INFORMACIÓN DEL PROVEEDOR',
        bold:true,
        marginBottom:5,
        style
    }

    const rfc:Content = {
        text:`RFC: ${proveedor.rfc}`,
        style
    }
    const razonSocial:Content = {
        text:`RAZÓN SOCIAL: ${proveedor.razonSocial}`,
        style
    }
    const tipoPorveedor:Content = {
        text:`TIPO DE PROVEEDOR: ${proveedor.tipoProveedor}`,
        style
    }

    const domicilioFiscal:Content = {   
        text:`DOMICILIO FISCAL: ${proveedor.domicilioFiscal}`,
        style
    }

    return [
        titulo,
        razonSocial,
        rfc,
        tipoPorveedor,
        domicilioFiscal,
    ];
}