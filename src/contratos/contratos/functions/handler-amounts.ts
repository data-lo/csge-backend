import { Decimal } from 'decimal.js';
import { TYPE_EVENT_ORDER } from 'src/contratos/enums/type-event-order';
import { TYPE_EVENT_INVOICE } from 'src/ordenes/factura/enums/type-event-invoice';

interface Props {
    contract: {
        availableAmount: number;
        paidAmount: number;
        executedAmount: number;
        activeAmount: number;
        committedAmount: number;
    };
    contractByServiceType: {
        paidAmount: number;
        executedAmount: number;
        activeAmount: number;
    };
    eventType: TYPE_EVENT_ORDER | TYPE_EVENT_INVOICE;
    totalOrder: string;
}

export function handlerAmounts(values: Props) {
    let newValues = {
        contract: {
            availableAmount: new Decimal(values.contract.availableAmount),
            paidAmount: new Decimal(values.contract.paidAmount),
            executedAmount: new Decimal(values.contract.executedAmount),
            activeAmount: new Decimal(values.contract.activeAmount),
            committedAmount: new Decimal(values.contract.committedAmount)
        },
        contractByServiceType: {
            paidAmount: new Decimal(values.contractByServiceType.paidAmount),
            executedAmount: new Decimal(values.contractByServiceType.executedAmount),
            activeAmount: new Decimal(values.contractByServiceType.activeAmount)
        }
    };

    const totalOrder = new Decimal(values.totalOrder); // Convertimos el total a Decimal

    switch (values.eventType) {
        case TYPE_EVENT_ORDER.ORDER_APPROVED:
            newValues.contractByServiceType.activeAmount = newValues.contractByServiceType.activeAmount.plus(totalOrder);
            newValues.contract.activeAmount = newValues.contract.activeAmount.plus(totalOrder);
            newValues.contract.availableAmount = newValues.contract.availableAmount.minus(totalOrder);
            newValues.contract.committedAmount = newValues.contract.committedAmount.minus(totalOrder);
            break;

        case TYPE_EVENT_ORDER.ORDER_CANCELLED:
            newValues.contractByServiceType.activeAmount = newValues.contractByServiceType.activeAmount.minus(totalOrder);
            newValues.contract.availableAmount = newValues.contract.availableAmount.plus(totalOrder);
            newValues.contract.activeAmount = newValues.contract.activeAmount.minus(totalOrder);
            break;

        case TYPE_EVENT_INVOICE.INVOICE_REVIEWED:
            newValues.contractByServiceType.activeAmount = newValues.contractByServiceType.activeAmount.minus(totalOrder);
            newValues.contractByServiceType.executedAmount = newValues.contractByServiceType.executedAmount.plus(totalOrder);
            newValues.contract.activeAmount = newValues.contract.activeAmount.minus(totalOrder);
            newValues.contract.executedAmount = newValues.contract.executedAmount.plus(totalOrder);
            break;

        case TYPE_EVENT_INVOICE.INVOICE_CANCELLED:
            newValues.contractByServiceType.activeAmount = newValues.contractByServiceType.activeAmount.plus(totalOrder);
            newValues.contractByServiceType.executedAmount = newValues.contractByServiceType.executedAmount.minus(totalOrder);
            newValues.contract.activeAmount = newValues.contract.activeAmount.plus(totalOrder);
            newValues.contract.executedAmount = newValues.contract.executedAmount.minus(totalOrder);
            break;

        case TYPE_EVENT_INVOICE.INVOICE_PAID:
            newValues.contractByServiceType.executedAmount = newValues.contractByServiceType.executedAmount.minus(totalOrder);
            newValues.contractByServiceType.paidAmount = newValues.contractByServiceType.paidAmount.plus(totalOrder);
            newValues.contract.executedAmount = newValues.contract.executedAmount.minus(totalOrder);
            newValues.contract.paidAmount = newValues.contract.paidAmount.plus(totalOrder);
            break;
    }

    return {
        contract: {
            availableAmount: newValues.contract.availableAmount.toDecimalPlaces(4).toNumber(),
            paidAmount: newValues.contract.paidAmount.toDecimalPlaces(4).toNumber(),
            executedAmount: newValues.contract.executedAmount.toDecimalPlaces(4).toNumber(),
            activeAmount: newValues.contract.activeAmount.toDecimalPlaces(4).toNumber(),
            committedAmount: newValues.contract.committedAmount.toDecimalPlaces(4).toNumber()
        },
        contractByServiceType: {
            paidAmount: newValues.contractByServiceType.paidAmount.toDecimalPlaces(4).toNumber(),
            executedAmount: newValues.contractByServiceType.executedAmount.toDecimalPlaces(4).toNumber(),
            activeAmount: newValues.contractByServiceType.activeAmount.toDecimalPlaces(4).toNumber()
        }
    };
}
