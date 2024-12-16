import { Content } from "pdfmake/interfaces";
import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";

export const cotejadorSection = (cotejador:Usuario):Content => {

    const {nombres, primerApellido, segundoApellido, rfc, correo} = cotejador;
    const year = new Date().getFullYear();
    const day = new Date().getDate();
    const month = new Date().getMonth();

    const style = {
        font:'Poppins',
        fontSize:8,
    }

    const qrText =
        `TESTIGO COTEJADO POR: ${nombres} ${primerApellido} ${segundoApellido}
        CON RFC: ${rfc}, CORREO INSTITUCIONAL: ${correo.toLowerCase()}
        CON FECHA DE COTEJO: ${day}-${month}-${year}`;

    const cotejadorSectionContent:Content = {
        style,
        alignment:'left',
        layout:'lightHorizontalLines',
        table:{
            widths:'auto',
            heights:[30],
            body:
            [   
                [{qr:qrText, fit:'100'}],
                [{text:''}],
                [{text:`RECIBIDO Y COTEJADO POR: ${primerApellido} ${segundoApellido} ${nombres}`}],
                [{text:`RFC: ${rfc}`}],
                [{text:`CORREO INSTITUCIONAL: ${correo}`}],
                [{text:`DIA DE COTEJO: ${day}-${month + 1}-${year}`}]
            ]
        }
    }
    return cotejadorSectionContent;
}