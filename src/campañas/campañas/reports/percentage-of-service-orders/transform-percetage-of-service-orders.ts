import { PercentageOfServiceOrders } from "./query-response";

export async function transformPercentageOfServiceOrders(data: PercentageOfServiceOrders[]) {
  const totalOrders = data.length;
  const map = new Map<string, PercentageOfServiceOrders[]>();

  for (const item of data) {
    const key = `${item.campaign_id}-${item.order_service_type}`;
    const existingList = map.get(key);

    if (existingList) {
      existingList.push(item);
    } else {
      map.set(key, [item]);
    }
  }

  const transformedData = Array.from(map.values()).map(group => {
    const first = group[0];
    const orderCount = group.length;
    const percentage = (orderCount / totalOrders) * 100;

    return {
      "CAMPAÑA": first.campaign_name,
      "ESTATUS": first.campaign_status,
      "TIPO DE SERVICIO": first.order_service_type,
      "FECHA DE INICIO": first.activation_start_date,
      "FECHA DE CIERRE": first.activation_end_date,
      "ÓRDENES AGRUPADAS": orderCount,
      "PORCENTAJE DEL TOTAL": `${percentage.toFixed(2)}%`
    };
  });

  return transformedData;
}
