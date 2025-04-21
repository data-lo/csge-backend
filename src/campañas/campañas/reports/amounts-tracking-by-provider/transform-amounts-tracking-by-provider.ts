import Decimal from "decimal.js";
import { FilteredAmountsTrackingByProvider } from "./filtered-data-response";
import { AmountsTrackingByProvider } from "./query-response";
import { CAMPAIGN_STATUS } from "../../interfaces/estatus-campaña.enum";

// export async function transformAmountsTrackingByProvider(data: AmountsTrackingByProvider[]) {
//   const map = new Map<string, FilteredAmountsTrackingByProvider>();

//   for (const item of data) {
//     const key = `${item.provider_id}-${item.contract_id}`;

//     const existing = map.get(key);

//     const parsedContractMax = new Decimal(item.contract_max_amount || "0");
//     const parsedContractSpent = new Decimal(item.contract_spent_amount || "0");
//     const parsedContractPaid = new Decimal(item.contract_paid_amount || "0");
//     const parsedOrderTotal = new Decimal(item.order_total || "0");

//     if (existing) {
//       existing.contractMaxAmount = new Decimal(existing.contractMaxAmount).plus(parsedContractMax).toNumber();
//       existing.contractSpentAmount = new Decimal(existing.contractSpentAmount).plus(parsedContractSpent).toNumber();
//       existing.contractPaidAmount = new Decimal(existing.contractPaidAmount).plus(parsedContractPaid).toNumber();
//       existing.totalOrderAmount = new Decimal(existing.totalOrderAmount).plus(parsedOrderTotal).toNumber();
//     } else {
//       map.set(key, {
//         campaignName: item.campaign_name,
//         providerId: item.provider_id,
//         contractId: item.contract_id,
//         providerName: item.provider_business_name,
//         providerRFC: item.provider_rfc,

//         contractNumber: item.contract_number,
//         contractMaxAmount: parsedContractMax.toNumber(),
//         contractSpentAmount: parsedContractSpent.toNumber(),
//         contractPaidAmount: parsedContractPaid.toNumber(),

//         totalOrderAmount: parsedOrderTotal.toNumber(),
//       });
//     }
//   }
//   const transformedData = Array.from(map.values());

//   const dataToExport = transformedData.map(item => ({
//     "CAMPAÑA": item.campaignName,
//     "PROVEEDOR": item.providerName,
//     "RFC": item.providerRFC,
//     "NÚMERO DE CONTRATO": item.contractNumber,
//     "MONTO MÁXIMO": item.contractMaxAmount,
//     "MONTO EJERCIDO": item.contractSpentAmount,
//     "MONTO PAGADO": item.contractPaidAmount,
//     "MONTO TOTAL DE LAS ORDENES": item.totalOrderAmount,
//   }));

//   return dataToExport;
// }

export async function transformAmountsTrackingByProvider(data: AmountsTrackingByProvider[]) {
  const map = new Map<string, FilteredAmountsTrackingByProvider>();

  for (const item of data) {
    const key = `${item.campaign_name}-${item.provider_id}`;

    const existing = map.get(key);

    const parsedContractMax = new Decimal(item.contract_max_amount || "0");
    const parsedContractSpent = new Decimal(item.contract_spent_amount || "0");
    const parsedContractPaid = new Decimal(item.contract_paid_amount || "0");
    const parsedOrderTotal = new Decimal(item.order_total || "0");

    // 🆕 Montos de contratos modificatorios
    const parsedAmmendmentSpent = new Decimal(item.ammendment_contract_executed_amount || "0");
    const parsedAmmendmentPaid = new Decimal(item.ammendment_contract_paid_amount || "0");

    if (existing) {
      existing.contractMaxAmount = new Decimal(existing.contractMaxAmount).plus(parsedContractMax).toNumber();
      existing.contractSpentAmount = new Decimal(existing.contractSpentAmount).plus(parsedContractSpent).plus(parsedAmmendmentSpent).toNumber();
      existing.contractPaidAmount = new Decimal(existing.contractPaidAmount).plus(parsedContractPaid).plus(parsedAmmendmentPaid).toNumber();
      existing.totalOrderAmount = new Decimal(existing.totalOrderAmount).plus(parsedOrderTotal).toNumber();
    } else {
      map.set(key, {
        campaignName: item.campaign_name,
        campaignStatus: item.campaign_status as CAMPAIGN_STATUS,
        startAt: item.activation_start_date,
        endDate: item.activation_end_date,
        providerRFC: item.provider_rfc,
        contractMaxAmount: parsedContractMax.toNumber(),
        contractSpentAmount: parsedContractSpent.plus(parsedAmmendmentSpent).toNumber(),
        contractPaidAmount: parsedContractPaid.plus(parsedAmmendmentPaid).toNumber(),
        totalOrderAmount: parsedOrderTotal.toNumber(),
      });
    }
  }

  const transformedData = Array.from(map.values());

  const dataToExport = transformedData.map(item => ({
    "CAMPAÑA": item.campaignName,
    "ESTATUS DE LA CAMPAÑA": item.campaignStatus,
    "FECHA DE INICIO": item.startAt,
    "FECHA DE CIERRE": item.endDate,
    "PROVEEDOR RFC": item.providerRFC,
    "MONTO MÁXIMO": item.contractMaxAmount,
    "MONTO EJERCIDO": item.contractSpentAmount,
    "MONTO PAGADO": item.contractPaidAmount,
    "MONTO TOTAL DE LAS ORDENES": item.totalOrderAmount,
  }));

  return dataToExport;
}
