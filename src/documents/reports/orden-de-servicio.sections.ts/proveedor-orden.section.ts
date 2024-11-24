import { Content } from "pdfmake/interfaces"
import { Proveedor } from "src/proveedores/proveedor/entities/proveedor.entity"


export const proveedorOrdenSection = (proveedor:Proveedor):Content[] => {

    const rfc:Content = {
        text:`RFC: ${proveedor.rfc}`
    }
    const razonSocial:Content = {
        text:`RAZÓN SOCIAL: ${proveedor.razonSocial}`
    }
    const tipoPorveedor:Content = {
        text:`TIPO DE PROVEEDOR: ${proveedor.tipoProveedor}`
    }

    return [
        razonSocial,
        rfc,
        tipoPorveedor
    ];
}