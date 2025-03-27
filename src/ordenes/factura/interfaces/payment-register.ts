import { INVOICE_STATUS } from "./estatus-factura";

export interface PaymentRegister {
    paidAmount: string, 
    checkNumber: number,
    paymentRegisteredAt: Date
}