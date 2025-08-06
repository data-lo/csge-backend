/**
 * Enum que representa los posibles estatus de una Orden de Servicio.
 */
export enum ESTATUS_ORDEN_DE_SERVICIO {

    /** La orden ha sido creada pero aún no ha sido activada ni procesada */
    PENDIENTE = "PENDIENTE",

    /** La orden se encuentra activa y puede ser utilizada o ejecutada */
    ACTIVA = "ACTIVA",

    /** La orden ha sido cotejada/verificada por el usuario responsable */
    COTEJADA = "COTEJADA",

    /** El pago de esta orden ha sido aprobado, pero aún no se ha efectuado */
    PAGO_APROBADO = "PAGO_APROBADO",
    

    /** El pago completo de esta orden ha sido realizado */
    PAGADA = "PAGADA",

    /** Solo se ha realizado un pago parcial de la orden */
    PARTIAL_PAY = "PAGO PARCIAL",

    /** La orden ha sido cancelada y no debe procesarse ni pagarse */
    CANCELADA = "CANCELADA"
}
