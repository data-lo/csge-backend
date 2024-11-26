import { Content } from 'pdfmake/interfaces';

export const serviciosContratadosSection = (serviciosContratados:ServiciosContratados):Content => {
    
    const serviciosDeOrden = serviciosContratados.serviciosContratados;
    const serviciosContratadosC:Content = {

        marginTop:10,
        alignment:'center',
        font:'Poppins',
        fontSize:8,
        layout:'lightHorizontalLines',
        table:{
            headerRows:1,
            widths:['auto','auto','auto','auto','auto','auto'],
            body:[
                [{text:'SERVICIO',bold:true,fillColor:'#caddfa'},
                 {text:'DESCRIPCIÓN',bold:true,fillColor:'#caddfa'},
                 {text:'TARIFA UNITARIA s/I.V.A',bold:true,fillColor:'#caddfa',fontSize:8},
                 {text:'CANTIDAD',bold:true,fillColor:'#caddfa'},
                 {text:'INICIO DEL SERVICIO',bold:true,fillColor:'#caddfa'},
                 {text:'FINALIZACIÓN DEL SERVICIO',bold:true,fillColor:'#caddfa'}
                ],
                ...serviciosDeOrden.map((servicioContratado) => [
                    servicioContratado.servicio.nombreDeServicio.toString(),
                    servicioContratado.servicio.descripcionDelServicio.toString(),
                    {text:`$${servicioContratado.servicio.tarifaUnitaria.toString()}`},
                    servicioContratado.cantidad.toString(),
                    servicioContratado.fechaInicio.toString(),
                    servicioContratado.fechaFinal.toString(),
                ])              
            ]
        },
    }
    return serviciosContratadosC
}

interface Cartelera {
    id?:string;
    ubicacion?:string;
    idCartelera?:string;

}

interface Servicio {
    nombreDeServicio?:string;
    descripcionDelServicio?:string;
    tarifaUnitaria?:string;
    iva?:string;
}


interface ServicioContratado {
    id:string;
    servicio:Servicio;
    calendarizacion?:Date[];
    observacion?:string;
    cantidad?:number;
    fechaInicio?:Date;
    fechaFinal?:Date;
    versionesSpot?:number;
    impactosVersionSpot?:number;
    numeroDiasSpot?:number;
    cartelera?:Cartelera;
}

interface ServiciosContratados {
    serviciosContratados:ServicioContratado[]
}