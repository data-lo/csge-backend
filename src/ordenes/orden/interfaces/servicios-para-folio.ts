import { TIPO_DE_SERVICIO } from "src/contratos/interfaces/tipo-de-servicio";

export class FolioServices {

    private abbreviations = {
        "CIN": TIPO_DE_SERVICIO.CINE,
        "CRE": TIPO_DE_SERVICIO.CREATIVOS,
        "DIG": TIPO_DE_SERVICIO.DIGITALES,
        "EML": TIPO_DE_SERVICIO.EMAILING,
        "ESP": TIPO_DE_SERVICIO.ESPECTACULARES,
        "EO": TIPO_DE_SERVICIO.ESTUDIO_DE_OPINION,
        "IMP": TIPO_DE_SERVICIO.IMPRESOS,
        "LOC": TIPO_DE_SERVICIO.LOCUCION,
        "MON": TIPO_DE_SERVICIO.MONITOREO,
        "PD": TIPO_DE_SERVICIO.PANTALLAS_DIGITALES,
        "PAU": TIPO_DE_SERVICIO.PAUTAS,
        "PM": TIPO_DE_SERVICIO.PLAN_DE_MEDIOS,
        "PROD": TIPO_DE_SERVICIO.PRODUCCION,
        "RAD": TIPO_DE_SERVICIO.RADIO,
        "REV": TIPO_DE_SERVICIO.REVISTA,
        "SPT": TIPO_DE_SERVICIO.SPOTS,
        "TV": TIPO_DE_SERVICIO.TELEVISION,
        "TES": TIPO_DE_SERVICIO.TESTIMONIALES,
        "VM": TIPO_DE_SERVICIO.VALLAS_MOVILES,
        "VID": TIPO_DE_SERVICIO.VIDEOS,
        "SG": TIPO_DE_SERVICIO.SERVICIOS_GENERALES,
    };

    getAbbreviation(serviceType: TIPO_DE_SERVICIO) {
        for (const [abbreviation, service] of Object.entries(this.abbreviations)) {
            if (service === serviceType) {
                return abbreviation;
            }
        }
        return undefined;
    }
}
