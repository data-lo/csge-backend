import { TipoDeServicio } from "src/contratos/interfaces/tipo-de-servicio";

export class ServiciosParaFolio {

    abreviaciones = {
    "SG": TipoDeServicio.SERVICIOS_GENERALES,
    "CAP": TipoDeServicio.CAPSULAS,
    "CAR": TipoDeServicio.CARTELERAS,
    "CIN": TipoDeServicio.CINE,
    "DIG": TipoDeServicio.DIGITALES,
    "EML": TipoDeServicio.EMAILING,
    "ESP": TipoDeServicio.ESPECTACULARES,
    "EO": TipoDeServicio.ESTUDIOS_DE_OPINION,
    "IMP": TipoDeServicio.IMPRESIONES,
    "IMP_P": TipoDeServicio.IMPRESION_PRENSA,
    "REV": TipoDeServicio.IMPRESION,
    "LOC": TipoDeServicio.LOCUCION,
    "MON": TipoDeServicio.MONITOREO,
    "PD": TipoDeServicio.PANTALLAS_DIGITALES,
    "PAU": TipoDeServicio.PAUTAS,
    "PM": TipoDeServicio.PLAN_DE_MEDIOS,
    "PROD": TipoDeServicio.PRODUCCION,
    "RAD": TipoDeServicio.RADIO,
    "SC": TipoDeServicio.SERVICIOS_CREATIVOS,
    "SPT": TipoDeServicio.SPOTS,
    "SW": TipoDeServicio.SOFTWARE,
    "TV": TipoDeServicio.TELEVISION,
    "TES": TipoDeServicio.TESTIMONIALES,
    "VM": TipoDeServicio.VALLAS_MOVILES,
    "VID": TipoDeServicio.VIDEOS,
    "INT": TipoDeServicio.INTERNET,
    "TLS": TipoDeServicio.TODOS_LOS_SERVICIOS,
    }

    obtenerAbreviacion(tipoDeServicio:TipoDeServicio){
        for(const [abreviacion, servicio] of Object.entries(this.abreviaciones)){
            if(servicio === tipoDeServicio){
                return abreviacion;
            }
        }
        return undefined;
    }

}


