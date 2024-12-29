import { Content } from "pdfmake/interfaces"
import { ContratoMaestro } from "src/contratos/contratos/entities/contrato.maestro.entity"
import { TipoProveedor } from "src/proveedores/proveedor/interfaces/tipo-proveedor.interface"


export const proveedorOrdenSection = (proveedor:interfaceProveedorI):Content[] => {

    const { rfc, razonSocial,tipoProveedor, domicilioFiscal, contratoMaestro } = proveedor;
    const proveedorSectionContent = []

    const style = {
        font:'Poppins',
        fontSize:12,
    }

    const tituloC:Content =  {
        text:'INFORMACIÓN DEL PROVEEDOR',
        bold:true,
        marginBottom:5,
        style
    }
    proveedorSectionContent.push(tituloC);

    if(rfc){
        const rfcC:Content = {
            text:`RFC: ${rfc}`,
            style
        }
        proveedorSectionContent.push(rfcC);
    }
    if(razonSocial){
        const razonSocialC:Content = {
            text:`RAZÓN SOCIAL: ${razonSocial}`,
            style
        }
        proveedorSectionContent.push(razonSocialC);
    }
    if(tipoProveedor){
        const tipoProveedorC:Content = {
            text:`TIPO DE PROVEEDOR: ${tipoProveedor}`,
            style
        }
        proveedorSectionContent.push(tipoProveedorC);
    }
    
    if(contratoMaestro){
        const numeroContratoC:Content = {
            text:`CONTRATO: ${contratoMaestro.numeroDeContrato}`
        }
        proveedorSectionContent.push(numeroContratoC);
    }
    
    if(domicilioFiscal){
        const domicilioFiscalC:Content = {
            text: `DOMICILIO FISCAL: ${proveedor.domicilioFiscal}`
        }
        proveedorSectionContent.push(domicilioFiscalC);
    }
    return proveedorSectionContent;
}

interface interfaceProveedorI {
    rfc:string,
    razonSocial:string,
    tipoProveedor:TipoProveedor,
    domicilioFiscal:string,
    contratoMaestro:ContratoMaestro|null
}