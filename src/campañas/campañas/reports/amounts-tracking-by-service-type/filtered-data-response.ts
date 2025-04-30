import { TIPO_DE_SERVICIO } from "src/contratos/interfaces/tipo-de-servicio";
import { CAMPAIGN_STATUS } from "../../interfaces/estatus-campaña.enum";

/**
 * Interfaz que representa la información financiera y de seguimiento de campañas
 * agrupada por proveedor dentro del sistema.
 */
export interface FilteredAmountsTrackingByServiceType {
    /** Fecha de inicio de la campaña */
    startAt: Date;

    /** Fecha de finalización de la campaña */
    endDate: Date;

    /** Nombre de la campaña */
    campaignName: string;

    /** Estatus actual de la campaña (por ejemplo: ACTIVA, INACTIVA, etc.) */
    campaignStatus: CAMPAIGN_STATUS;

    /** 
    * Monto emitido global (Suma de todas las órdenes de servicio emitidas)
    */
    serviceType: TIPO_DE_SERVICIO;

    /** 
     * Monto emitido global (Suma de todas las órdenes de servicio emitidas)
     */
    globalIssuedAmount: number;

    /**
     * Monto activo global (Valor de las órdenes de servicio actualmente activas)
     */
    globalActiveAmount: number;

    /**
     * Monto ejecutado global (Valor de las órdenes de servicio completamente ejecutadas)
     */
    globalExecutedAmount: number;

    /**
     * Monto pagado global (Valor de las órdenes de servicio totalmente pagadas)
     */
    globalPaidAmount: number;
}
