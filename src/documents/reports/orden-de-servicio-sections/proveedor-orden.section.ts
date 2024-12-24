import { Content } from "pdfmake/interfaces"
import { Contrato } from "src/contratos/contratos/entities/contrato.entity"
import { ContratoMaestro } from "src/contratos/contratos/entities/contrato.maestro.entity"
import { TipoProveedor } from "src/proveedores/proveedor/interfaces/tipo-proveedor.interface"


export const proveedorOrdenSection = (proveedor:interfaceProveedorI):Content[] => {

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
    const tipoProveedor:Content = {
        text:`TIPO DE PROVEEDOR: ${proveedor.tipoProveedor}`,
        style
    }

    const numeroContrato:Content = {
        text:`CONTRATO: ${proveedor.contratoMaestro.numeroDeContrato}`
    }

    const domicilioFiscal:Content = {
        text: `DOMICILIO FISCAL: ${proveedor.domicilioFiscal}`
    }

    return [
        titulo,
        razonSocial,
        rfc,
        tipoProveedor,
        numeroContrato,
        domicilioFiscal,
    ];
}

interface interfaceProveedorI {
    rfc:string,
    razonSocial:string,
    tipoProveedor:TipoProveedor,
    domicilioFiscal:string,
    contratoMaestro:ContratoMaestro
}