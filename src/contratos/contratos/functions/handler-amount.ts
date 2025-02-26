interface Props {
    masterContract: {
        availableAmount: number;
        paidAmount: number;
        executedAmount: number;
        activeAmount: number
    }
    contractByServiceType: {
        paidAmount: number;
        executedAmount: number;
        activeAmount: number
    }
    eventType: TYPE_EVENT_ORDER;
    totalOrder: number;
}
export function handlerAmounts(values: Props) {
    let newValues = {
        masterContract: { ...values.masterContract },
        contractByServiceType: { ...values.contractByServiceType }
    };

    switch (values.eventType) {
        case TYPE_EVENT_ORDER.ORDER_APPROVED:
            newValues.contractByServiceType.activeAmount += values.totalOrder;
            newValues.masterContract.activeAmount += values.totalOrder;
            newValues.masterContract.availableAmount -= values.totalOrder;
            break;

        case TYPE_EVENT_ORDER.ORDER_CANCELLED:
            newValues.contractByServiceType.activeAmount -= values.totalOrder;
            newValues.masterContract.activeAmount -= values.totalOrder;
            newValues.masterContract.availableAmount += values.totalOrder;
            break;
    }

    return newValues;
}
