import { match } from 'assert';
import { Decimal } from 'decimal.js';
import { TYPE_EVENT_ORDER } from 'src/contratos/enums/type-event-order';
import { TYPE_EVENT_INVOICE } from 'src/ordenes/factura/enums/type-event-invoice';

interface Props {
    match: {
        paidAmount: number;
        executedAmount: number;
        activeAmount: number;
    };
    eventType: TYPE_EVENT_ORDER | TYPE_EVENT_INVOICE;
    total: string;
}

export function handlerAmounts(values: Props) {
    let newValues = {
        match: {
            paidAmount: new Decimal(values.match.paidAmount),
            executedAmount: new Decimal(values.match.executedAmount),
            activeAmount: new Decimal(values.match.activeAmount),
        },
    };

    const total = new Decimal(values.total);

    switch (values.eventType) {
        case TYPE_EVENT_ORDER.ORDER_APPROVED:
            newValues.match.activeAmount = newValues.match.activeAmount.plus(total);
            break;

        case TYPE_EVENT_ORDER.ORDER_CANCELLED:
            newValues.match.activeAmount = newValues.match.activeAmount.minus(total);

            break;

        case TYPE_EVENT_INVOICE.INVOICE_REVIEWED:
            newValues.match.activeAmount = newValues.match.activeAmount.minus(total);
            newValues.match.executedAmount = newValues.match.executedAmount.plus(total);
            break;

        case TYPE_EVENT_INVOICE.INVOICE_CANCELLED:
            newValues.match.executedAmount = newValues.match.executedAmount.plus(total);
            newValues.match.activeAmount = newValues.match.activeAmount.minus(total);
            break;

        case TYPE_EVENT_INVOICE.INVOICE_PAID:
            newValues.match.executedAmount = newValues.match.executedAmount.minus(total);
            newValues.match.paidAmount = newValues.match.paidAmount.plus(total);
            break;
    }

    return {
        match: {
            paidAmount: newValues.match.paidAmount.toDecimalPlaces(2).toNumber(),
            executedAmount: newValues.match.executedAmount.toDecimalPlaces(2).toNumber(),
            activeAmount: newValues.match.activeAmount.toDecimalPlaces(2).toNumber(),
        },
    };
}
