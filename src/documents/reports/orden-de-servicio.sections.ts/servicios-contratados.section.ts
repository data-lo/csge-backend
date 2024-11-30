import { Content } from 'pdfmake/interfaces';
import { generarSVGCalendario } from '../sections/calendar.generator.section';

export const serviciosContratadosSection = (
  serviciosContratados: ServiciosContratados,
): Content => {
  const serviciosDeOrden = serviciosContratados.serviciosContratados;

  const serviciosContratadosC: Content = {
    marginTop: 10,
    alignment: 'center',
    font: 'Poppins',
    fontSize: 8,
    layout: 'lightHorizontalLines',
    table: {
      headerRows: 1,
      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
      heights: ['auto'],
      body: [
        [
          { text: 'SERVICIO', bold: true, fillColor: '#caddfa' },
          { text: 'DESCRIPCIÓN', bold: true, fillColor: '#caddfa' },
          {
            text: 'TARIFA UNITARIA s/I.V.A',
            bold: true,
            fillColor: '#caddfa',
            fontSize: 8,
          },
          { text: 'CANTIDAD', bold: true, fillColor: '#caddfa' },
          { text: 'INICIO DEL SERVICIO', bold: true, fillColor: '#caddfa' },
          {
            text: 'FINALIZACIÓN DEL SERVICIO',
            bold: true,
            fillColor: '#caddfa',
          },
        ],
        ...serviciosDeOrden.map((servicioContratado) => [
          servicioContratado.servicio.nombreDeServicio?.toString() || '',
          servicioContratado.servicio.descripcionDelServicio?.toString() || '',
          {
            text: `$${servicioContratado.servicio.tarifaUnitaria?.toString() || ''}`,
          },
          servicioContratado.cantidad?.toString() || '',
          servicioContratado.fechaInicio?.toString() || '',
          servicioContratado.fechaFinal?.toString() || '',
        ]),
      ],
    },
  };

  const especificaciones: Content[] = serviciosDeOrden
    .filter((servicioContratado) => tieneEspecificaciones(servicioContratado))
    .map((servicioContratado) => ({
      table: {
        font: 'Poppins',
        fontSize: '8',
        widths: ['auto', '*'],
        body: [
          [
            {
              text: 'ESPECIFICACIONES DEL SERVICIO',
              bold: true,
              colSpan: 2,
              font: 'Poppins',
              fontSize: 8,
            },
            {},
          ],
          [...obtenerEspecificaciones(servicioContratado)],
        ],
      },
      margin: [0, 10, 0, 10],
    }));

  return {
    stack: [serviciosContratadosC, ...especificaciones],
  };
};

const tieneEspecificaciones = (servicioContratado: ServicioContratado) => {
  const {
    calendarizacion,
    observacion,
    versionesSpot,
    impactosVersionSpot,
    numeroDiasSpot,
    cartelera,
  } = servicioContratado;
  return (
    calendarizacion?.length > 0 ||
    observacion ||
    versionesSpot ||
    impactosVersionSpot ||
    numeroDiasSpot ||
    cartelera
  );
};

const obtenerEspecificaciones = (servicioContratado: ServicioContratado) => {
  const {
    calendarizacion,
    observacion,
    versionesSpot,
    impactosVersionSpot,
    numeroDiasSpot,
    cartelera,
  } = servicioContratado;

  const especificaciones: Array<any[]> = [];

  if (observacion) {
    especificaciones.push([
      { text: 'OBSERVACIÓN:', bold: true, font: 'Poppins', fontSize: 8 },
      { text: observacion, font: 'Poppins', fontSize: 8 },
    ]);
  }
  if (calendarizacion?.length) {
    const diasMarcados = calendarizacion.map((fecha) => fecha.getDate());
    const mes = calendarizacion[0].getMonth();
    const anio = calendarizacion[0].getFullYear();

    const svgCalendario = generarSVGCalendario(diasMarcados, mes, anio);

    especificaciones.push([
      { text: 'CALENDARIZACIÓN:', bold: true, font: 'Poppins', fontSize: 8, padding:10},
      { svg: svgCalendario },
    ]);
  }
  if (versionesSpot) {
    especificaciones.push([
      { text: 'VERSIONES SPOTS:', bold: true, font: 'Poppins', fontSize: 8 },
      versionesSpot.toString(),
    ]);
  }
  if (impactosVersionSpot) {
    especificaciones.push([
      {
        text: 'IMPACTOS POR VERSION:',
        bold: true,
        font: 'Poppins',
        fontSize: 8,
      },
      impactosVersionSpot.toString(),
    ]);
  }
  if (numeroDiasSpot) {
    especificaciones.push([
      {
        text: 'NÚMERO DE DÍAS DEL SPOT:',
        bold: true,
        font: 'Poppins',
        fontSize: 8,
      },
      numeroDiasSpot.toString(),
    ]);
  }
  if (cartelera) {
    especificaciones.push([
      { text: 'CARTELERA:', bold: true, font: 'Poppins', fontSize: 8 },
      `UBICACIÓN: ${cartelera.ubicacion || ''}, ID CARTELERA: ${cartelera.idCartelera || ''}`,
    ]);
  }
  return especificaciones;
};

interface Cartelera {
  id?: string;
  ubicacion?: string;
  idCartelera?: string;
}

interface Servicio {
  nombreDeServicio?: string;
  descripcionDelServicio?: string;
  tarifaUnitaria?: string;
  iva?: string;
}

interface ServicioContratado {
  id: string;
  servicio: Servicio;
  calendarizacion?: Date[];
  observacion?: string;
  cantidad?: number;
  fechaInicio?: Date;
  fechaFinal?: Date;
  versionesSpot?: number;
  impactosVersionSpot?: number;
  numeroDiasSpot?: number;
  cartelera?: Cartelera;
}

interface ServiciosContratados {
  serviciosContratados: ServicioContratado[];
}
