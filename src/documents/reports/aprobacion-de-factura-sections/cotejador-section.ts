import { Content } from "pdfmake/interfaces";
import { Usuario } from "src/administracion/usuarios/entities/usuario.entity";

export const cotejadorSection = (cotejador:Usuario,fechaDeCotejoDate:Date):Content => {

    const {nombres, primerApellido, segundoApellido, rfc, correo} = cotejador;
    const style = {
        font:'Poppins',
        fontSize:8,
    }

    const day = new Date(fechaDeCotejoDate).getDate();
    const month = new Date(fechaDeCotejoDate).getMonth()+1;
    const year = new Date(fechaDeCotejoDate).getFullYear();

    const fechaDeCotejo = `${day}-${month}-${year}`
    
    const qrText =
        `TESTIGO COTEJADO POR: ${nombres} ${primerApellido} ${segundoApellido}
        CON RFC: ${rfc}, CORREO INSTITUCIONAL: ${correo.toLowerCase()}
        CON FECHA DE COTEJO: ${fechaDeCotejo}`;

    

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
                [{text:`CORREO INSTITUCIONAL: ${correo.toLowerCase()}`}],
                [{text:`FECHA DE COTEJO: ${fechaDeCotejo}`}]
            ]
        }
    }
    return cotejadorSectionContent;
}