interface Props {
    masterContract: {
        availableAmount: number;
        paidAmount: number;
        executedAmount: number;
        activeAmount: number;
        committedAmount: number
    }
    contractByServiceType: {
        paidAmount: number;
        executedAmount: number;
        activeAmount: number
    }
    eventType: TYPE_EVENT_ORDER | TYPE_EVENT_INVOICE;
    totalOrder: number;
}
export function handlerAmounts(values: Props) {
    let newValues = {
        masterContract: {
            availableAmount: Number(values.masterContract.availableAmount),
            paidAmount: Number(values.masterContract.paidAmount),
            executedAmount: Number(values.masterContract.executedAmount),
            activeAmount: Number(values.masterContract.activeAmount),
            committedAmount: Number(values.masterContract.committedAmount)
        },
        contractByServiceType: {
            paidAmount: Number(values.contractByServiceType.paidAmount),
            executedAmount: Number(values.contractByServiceType.executedAmount),
            activeAmount: Number(values.contractByServiceType.activeAmount)
        }
    };

    switch (values.eventType) {
        case TYPE_EVENT_ORDER.ORDER_APPROVED:
            newValues.contractByServiceType.activeAmount += Number(values.totalOrder);
            newValues.masterContract.activeAmount += Number(values.totalOrder);
            newValues.masterContract.availableAmount -= Number(values.totalOrder);
            newValues.masterContract.availableAmount -= Number(values.totalOrder);
            newValues.masterContract.committedAmount -= Number(values.totalOrder);
            break;

        case TYPE_EVENT_ORDER.ORDER_CANCELLED:
            newValues.contractByServiceType.activeAmount -= Number(values.totalOrder);
            newValues.masterContract.activeAmount -= Number(values.totalOrder);
            break;

        case TYPE_EVENT_INVOICE.INVOICE_REVIEWED:
            newValues.contractByServiceType.activeAmount -= Number(values.totalOrder);
            newValues.contractByServiceType.executedAmount += Number(values.totalOrder);
            newValues.masterContract.activeAmount -= Number(values.totalOrder);
            newValues.masterContract.executedAmount += Number(values.totalOrder);
            break;

        case TYPE_EVENT_INVOICE.INVOICE_CANCELLED:
            newValues.contractByServiceType.activeAmount += Number(values.totalOrder);
            newValues.contractByServiceType.executedAmount -= Number(values.totalOrder);
            newValues.masterContract.activeAmount += Number(values.totalOrder);
            newValues.masterContract.executedAmount += Number(values.totalOrder);
            break;
    }

    return newValues;
}
