import { Proveedor } from "../../entities/proveedor.entity";

export function transformActiveContractTracking(providers: Proveedor[]) {

    const result = [];

    for (const provider of providers) {
        for (const masterContract of provider.contratosMaestros) {
            result.push({
                providerName: provider.razonSocial,
                providerRFC: provider.rfc,
                contractNumber: masterContract.numeroDeContrato,
                contractStatus: masterContract.estatusDeContrato,
                contractType: masterContract.tipoDeContrato,
                extensionType: "N/A",
                contractedMin: masterContract.montoMinimoContratado ? masterContract.montoMinimoContratado : "N/A",
                vatContractedMin: masterContract.ivaMontoMinimoContratado ? masterContract.ivaMontoMinimoContratado : "N/A",
                contractedMax: masterContract.montoMaximoContratado,
                vatContractedMax: masterContract.ivaMontoMaximoContratado,
                availableAmount: masterContract.montoDisponible,
                paidAmount: masterContract.montoPagado,
                exercisedAmount: masterContract.montoEjercido,
                activeAmount: masterContract.montoActivo,
                startDate: new Date(masterContract.fechaInicial),
                endDate: new Date(masterContract.fechaFinal),
                isAmendment: false,
            });

            if (masterContract.contratosModificatorios) {
                for (const amendmentContract of masterContract.contratosModificatorios) {
                    result.push({
                        providerName: provider.razonSocial,
                        providerRFC: provider.rfc,
                        contractNumber: amendmentContract.numeroDeContrato,
                        contractStatus: amendmentContract.estatusDeContrato,
                        contractType: amendmentContract.contractType,
                        extensionType: amendmentContract.extensionType,
                        contractedMin: masterContract.montoMinimoContratado ? masterContract.montoMinimoContratado : "N/A",
                        vatContractedMin: masterContract.ivaMontoMinimoContratado ? masterContract.ivaMontoMinimoContratado : "N/A",
                        contractedMax: amendmentContract.montoMaximoContratado ? amendmentContract.montoMaximoContratado : "N/A",
                        vatContractedMax: amendmentContract.ivaMontoMaximoContratado ? amendmentContract.ivaMontoMaximoContratado : "N/A",
                        availableAmount: masterContract.montoDisponible,
                        paidAmount: masterContract.montoPagado,
                        exercisedAmount: masterContract.montoEjercido,
                        activeAmount: masterContract.montoActivo,
                        startDate: amendmentContract.fechaInicial ? new Date(amendmentContract.fechaInicial) : "N/A",
                        endDate: amendmentContract.fechaFinal ? new Date(amendmentContract.fechaFinal) : "N/A",
                        isAmendment: true,
                    })
                }
            }
        }
    }

    const dataToExport = result.map(contract => ({
        "PROVEEDOR RFC": contract.providerRFC,
        "PROVEEDOR RAZÓN SOCIAL": contract.providerName,
        "NÚMERO DE CONTRATO": contract.contractNumber,
        "TIPO DE CONTRATO": contract.contractType,
        "¿ES CONTRATO MODIFICATORIO?": contract.isAmendment ? "SI" : "NO",
        "TIPO DE EXTENSIÓN": contract.extensionType,
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

    return dataToExport
}