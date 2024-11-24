import { Content } from 'pdfmake/interfaces';

interface Servicio {
    nombreDelServicio:string,
    tipoDeServicio:string,
    descripcionDelServicio:string,
    tarifaUnitaria:string,
}

interface ServicioContratado {
    servicio:Servicio,
    calendarizacion: Date[],
    observacion: string,
    cantidad: number,
    fechaInicio:Date,
    fechaFinal:Date,
    versionesSpot: number,
    impactosVersionSpot:number,
    numeroDiasSpot: number,
    cartelera: string,
}

interface ServiciosContratados {
    serviciosContratados:ServicioContratado[]
}




export const serviciosContratadosSection = (serviciosContratados:ServiciosContratados):Content => {
    
    const serviciosDeOrden = serviciosContratados.serviciosContratados;
    const serviciosContratadosC:Content = {
        table:{
            headerRows:1,
            widths:['*','*','*','*','*','*'],
            body:[
                ['SERVICIO','DESCRIPCIÓN','TARIFA UNITARIA','CANTIDAD','INICIO DEL SERVICIO','FINALIZACION DEL SERVICIO'],
                ...serviciosDeOrden.map((servicioContratado) => [
                    servicioContratado.servicio.nombreDelServicio.toString(),
                    servicioContratado.servicio.descripcionDelServicio.toString(),
                    servicioContratado.servicio.tarifaUnitaria.toString(),
                    servicioContratado.fechaInicio.toString(),
                    servicioContratado.fechaFinal.toString(),
                ])              
            ]
        }
    }
    return serviciosContratadosC
}