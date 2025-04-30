import { FilteredDataResponse } from "./filtered-data-response";
import { MasterContract, AmendmentContract } from "./query-response";



export function transformActiveContractTracking(
    masterContracts: MasterContract[],
    amendmentContracts: AmendmentContract[]
) {
    const result = [];

    for (const contract of masterContracts) {
        result.push({
            contractNumber: contract.contract_number,
            contractStatus: contract.contract_status,
            contractType: contract.contract_type,
            extensionType: "N/A",
            contractedMin: parseFloat(contract.minimum_contracted_amount) ? parseFloat(contract.minimum_contracted_amount) : "N/A",
            vatContractedMin: parseFloat(contract.vat_minimum_contracted_amount) ? parseFloat(contract.vat_minimum_contracted_amount) : "N/A",
            contractedMax: parseFloat(contract.maximum_contracted_amount),
            vatContractedMax: parseFloat(contract.vat_maximum_contracted_amount),
            reservedAmount: parseFloat(contract.reserved_amount),
            availableAmount: parseFloat(contract.available_amount),
            paidAmount: parseFloat(contract.paid_amount),
            exercisedAmount: parseFloat(contract.exercised_amount),
            activeAmount: parseFloat(contract.active_amount),
            startDate: new Date(contract.start_date),
            endDate: new Date(contract.end_date),
            isAmendment: false,
        });
    }

    for (const amendment of amendmentContracts) {
        result.push({
            contractNumber: amendment.contract_number,
            contractStatus: amendment.contract_status,
            contractType: amendment.amendment_contract_type,
            extensionType: amendment.extension_type,

            contractedMin: parseFloat(amendment.minimum_contracted_amount) ? parseFloat(amendment.minimum_contracted_amount) : "N/A",
            vatContractedMin: parseFloat(amendment.vat_minimum_contracted_amount) ? parseFloat(amendment.vat_minimum_contracted_amount) : "N/A",

            contractedMax: parseFloat(amendment.maximum_contracted_amount) ? parseFloat(amendment.maximum_contracted_amount) : "N/A",
            vatContractedMax: parseFloat(amendment.vat_maximum_contracted_amount) ? parseFloat(amendment.vat_maximum_contracted_amount) : "N/A",

            reservedAmount: parseFloat(amendment.reserved_amount),
            availableAmount: parseFloat(amendment.available_amount),
            paidAmount: parseFloat(amendment.paid_amount),
            exercisedAmount: parseFloat(amendment.exercised_amount),
            activeAmount: parseFloat(amendment.active_amount),

            startDate: amendment.start_date ? new Date(amendment.start_date) : "N/A",
            endDate: amendment.end_date ? new Date(amendment.end_date) : "N/A",
            isAmendment: true,
        });
    }

    const dataToExport = result.map(contract => ({
        "NÚMERO DE CONTRATO": contract.contractNumber,
        "TIPO DE CONTRATO": contract.contractType,
        "TIPO DE EXTENSIÓN": contract.extensionType,
        "¿ES CONTRATO MODIFICATORIO?": contract.isAmendment ? "SI" : "NO",
        "ESTATUS": contract.contractStatus,
        "MONTO MÍNIMO": contract.contractedMin,
        "IVA MÍNIMO": contract.vatContractedMin,
        "MONTO MÁXIMO": contract.contractedMax,
        "IVA MÁXIMO": contract.vatContractedMax,
        "MONTO RESERVADO": contract.reservedAmount,
        "MONTO DISPONIBLE": contract.availableAmount,
        "MONTO PAGADO": contract.paidAmount,
        "MONTO EJERCIDO": contract.exercisedAmount,
        "MONTO ACTIVO": contract.activeAmount,
        "FECHA INICIO": contract.startDate,
        "FECHA FIN": contract.endDate,
    }));


    return dataToExport;
}
