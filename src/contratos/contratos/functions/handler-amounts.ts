import { Decimal } from 'decimal.js';

interface Props {
    masterContract: {
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
        masterContract: {
            availableAmount: new Decimal(values.masterContract.availableAmount),
            paidAmount: new Decimal(values.masterContract.paidAmount),
            executedAmount: new Decimal(values.masterContract.executedAmount),
            activeAmount: new Decimal(values.masterContract.activeAmount),
            committedAmount: new Decimal(values.masterContract.committedAmount)
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
            newValues.masterContract.activeAmount = newValues.masterContract.activeAmount.plus(totalOrder);
            newValues.masterContract.availableAmount = newValues.masterContract.availableAmount.minus(totalOrder);
            newValues.masterContract.committedAmount = newValues.masterContract.committedAmount.minus(totalOrder);
            break;

        case TYPE_EVENT_ORDER.ORDER_CANCELLED:
            newValues.contractByServiceType.activeAmount = newValues.contractByServiceType.activeAmount.minus(totalOrder);
            newValues.masterContract.availableAmount = newValues.masterContract.availableAmount.plus(totalOrder);
            newValues.masterContract.activeAmount = newValues.masterContract.activeAmount.minus(totalOrder);
            break;

        case TYPE_EVENT_INVOICE.INVOICE_REVIEWED:
            newValues.contractByServiceType.activeAmount = newValues.contractByServiceType.activeAmount.minus(totalOrder);
            newValues.contractByServiceType.executedAmount = newValues.contractByServiceType.executedAmount.plus(totalOrder);
            newValues.masterContract.activeAmount = newValues.masterContract.activeAmount.minus(totalOrder);
            newValues.masterContract.executedAmount = newValues.masterContract.executedAmount.plus(totalOrder);
            break;

        case TYPE_EVENT_INVOICE.INVOICE_CANCELLED:
            newValues.contractByServiceType.activeAmount = newValues.contractByServiceType.activeAmount.plus(totalOrder);
            newValues.contractByServiceType.executedAmount = newValues.contractByServiceType.executedAmount.minus(totalOrder);
            newValues.masterContract.activeAmount = newValues.masterContract.activeAmount.plus(totalOrder);
            newValues.masterContract.executedAmount = newValues.masterContract.executedAmount.minus(totalOrder);
            break;

        case TYPE_EVENT_INVOICE.INVOICE_PAID:
            newValues.contractByServiceType.executedAmount = newValues.contractByServiceType.executedAmount.minus(totalOrder);
            newValues.contractByServiceType.paidAmount = newValues.contractByServiceType.paidAmount.plus(totalOrder);
            newValues.masterContract.executedAmount = newValues.masterContract.executedAmount.minus(totalOrder);
            newValues.masterContract.paidAmount = newValues.masterContract.paidAmount.plus(totalOrder);
            break;
    }

    return {
        masterContract: {
            availableAmount: newValues.masterContract.availableAmount.toDecimalPlaces(4).toNumber(),
            paidAmount: newValues.masterContract.paidAmount.toDecimalPlaces(4).toNumber(),
            executedAmount: newValues.masterContract.executedAmount.toDecimalPlaces(4).toNumber(),
            activeAmount: newValues.masterContract.activeAmount.toDecimalPlaces(4).toNumber(),
            committedAmount: newValues.masterContract.committedAmount.toDecimalPlaces(4).toNumber()
        },
        contractByServiceType: {
            paidAmount: newValues.contractByServiceType.paidAmount.toDecimalPlaces(4).toNumber(),
            executedAmount: newValues.contractByServiceType.executedAmount.toDecimalPlaces(4).toNumber(),
            activeAmount: newValues.contractByServiceType.activeAmount.toDecimalPlaces(4).toNumber()
        }
    };
}
