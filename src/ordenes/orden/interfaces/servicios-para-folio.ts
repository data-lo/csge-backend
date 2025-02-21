import { TIPO_DE_SERVICIO } from "src/contratos/interfaces/tipo-de-servicio";

export class ServiciosParaFolio {

    abreviaciones = {
        "CIN": TIPO_DE_SERVICIO.CINE,
        "DIG": TIPO_DE_SERVICIO.DIGITALES,
        "EML": TIPO_DE_SERVICIO.EMAILING,
        "ESP": TIPO_DE_SERVICIO.ESPECTACULARES,
        "REV": TIPO_DE_SERVICIO.REVISTA,
        "LOC": TIPO_DE_SERVICIO.LOCUCION,
        "MON": TIPO_DE_SERVICIO.MONITOREO,
        "PD": TIPO_DE_SERVICIO.PANTALLAS_DIGITALES,
        "PAU": TIPO_DE_SERVICIO.PAUTAS,
        "PM": TIPO_DE_SERVICIO.PLAN_DE_MEDIOS,
        "PROD": TIPO_DE_SERVICIO.PRODUCCION,
        "RAD": TIPO_DE_SERVICIO.RADIO,
        "SPT": TIPO_DE_SERVICIO.SPOTS,
        "TV": TIPO_DE_SERVICIO.TELEVISION,
        "TES": TIPO_DE_SERVICIO.TESTIMONIALES,
        "VM": TIPO_DE_SERVICIO.VALLAS_MOVILES,
        "VID": TIPO_DE_SERVICIO.VIDEOS,
    }

    obtenerAbreviacion(TIPO_DE_SERVICIO: TIPO_DE_SERVICIO) {
        for (const [abreviacion, servicio] of Object.entries(this.abreviaciones)) {
            if (servicio === TIPO_DE_SERVICIO) {
                return abreviacion;
            }
        }
        return undefined;
    }

}


