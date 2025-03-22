// Esta interfaz representa la estructura utilizada para registrar los montos tomados de múltiples contratos
// (incluyendo modificatorios) cuando una orden no puede ser cubierta únicamente con el contrato original.
// Aunque inicialmente se diseñó para una sola orden, esta versión está adaptada para soportar múltiples órdenes.

export interface OrderContractBreakdown {
    orderId: string;
    total: string;
    contractAmountsUsed: {
      contractId: string;
      totalAmountUsedByThisContract: string;
    }[];
  }
  
  export type OrderContractBreakdownMap = {
    [orderId: string]: OrderContractBreakdown;
  };
  