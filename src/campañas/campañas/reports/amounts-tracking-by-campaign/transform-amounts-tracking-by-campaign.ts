import Decimal from "decimal.js";

import { AmountsTrackingByProvider } from "../query-response";
import { CAMPAIGN_STATUS } from "../../interfaces/estatus-campaña.enum";
import { ESTATUS_ORDEN_DE_SERVICIO } from "src/ordenes/orden/interfaces/estatus-orden-de-servicio";
import { FilteredAmountsTrackingByCampaing } from "./filtered-data-response";

export async function transformAmountsTrackingByCampaign(data: AmountsTrackingByProvider[]) {
  const map = new Map<string, FilteredAmountsTrackingByCampaing>();

  for (const item of data) {
    const key = `${item.campaign_id}`;

    let values = map.get(key);

    const orderTotal = new Decimal(item.order_total);

    if (values) {
      switch (item.order_status as ESTATUS_ORDEN_DE_SERVICIO) {
        case ESTATUS_ORDEN_DE_SERVICIO.ACTIVA:
          values.globalActiveAmount = new Decimal(values.globalActiveAmount).plus(orderTotal).toNumber();
          break;
        case ESTATUS_ORDEN_DE_SERVICIO.PAGADA || ESTATUS_ORDEN_DE_SERVICIO.PARTIAL_PAY:
          values.globalPaidAmount = new Decimal(values.globalPaidAmount).plus(orderTotal).toNumber();
          break;
        case ESTATUS_ORDEN_DE_SERVICIO.COTEJADA:
          values.globalExecutedAmount = new Decimal(values.globalExecutedAmount).plus(orderTotal).toNumber();
        default:
          break;
      }

      if (item.order_status !== ESTATUS_ORDEN_DE_SERVICIO.CANCELADA) {
        values.globalIssuedAmount = new Decimal(values.globalIssuedAmount).plus(orderTotal).toNumber();
      }

      map.set(key, values)
    } else {
      map.set(key, {
        campaignName: item.campaign_name,
        campaignStatus: item.campaign_status as CAMPAIGN_STATUS,
        startAt: item.activation_start_date,
        endDate: item.activation_end_date,
        globalIssuedAmount: orderTotal.toNumber(),
        globalActiveAmount: item.order_status === ESTATUS_ORDEN_DE_SERVICIO.ACTIVA ? orderTotal.toNumber() : 0,
        globalPaidAmount: item.order_status === ESTATUS_ORDEN_DE_SERVICIO.PAGADA ? orderTotal.toNumber() : 0,
        globalExecutedAmount: item.order_status === ESTATUS_ORDEN_DE_SERVICIO.COTEJADA ? orderTotal.toNumber() : 0,

      });
    }
  }

  const transformedData = Array.from(map.values());

  const dataToExport = transformedData.map(item => ({
    "CAMPAÑA": item.campaignName,
    "ESTATUS DE LA CAMPAÑA": item.campaignStatus,
    "FECHA DE INICIO": item.startAt,
    "FECHA DE CIERRE": item.endDate,
    "MONTO EMITIDO": item.globalIssuedAmount,
    "MONTO ACTIVO": item.globalActiveAmount,
    "MONTO EJECUTADO": item.globalExecutedAmount,
    "MONTO PAGADO": item.globalPaidAmount,
  }));

  return dataToExport;
}
