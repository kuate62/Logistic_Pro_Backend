import ShipmentModel from "../model/ShipmentModel.js";
import ParcelModel from "../model/ParcelModel.js";
import PaymentModel from "../model/PaymentModel.js";
import ClientModel from "../model/ClientModel.js";
import PartnerRequestModel from "../model/PartnerRequestModel.js";
import SubscriptionPaymentModel from "../model/SubscriptionPaymentModel.js";
import InvoiceModel from "../model/InvoiceModel.js";

const pad = (value, size = 4) => String(value).padStart(size, '0');

const nextSequence = async (model, prefix, column, currentYear, transaction) => {
    const like = currentYear ? `${prefix}-${currentYear}-%` : `${prefix}-%`;

    const rows = await model.findAll({
        where: model.sequelize.where(
            model.sequelize.fn('LOWER', model.sequelize.col(column)),
            'LIKE',
            like
        ),
        attributes: [column],
        transaction
    });

    let max = 0;
    rows.forEach((row) => {
        const value = String(row[column]);
        const match = currentYear
            ? value.match(new RegExp(`^${prefix}-${currentYear}-(\\d+)$`))
            : value.match(new RegExp(`^${prefix}-(\\d+)$`));
        if (match) max = Math.max(max, parseInt(match[1], 10));
    });

    return max + 1;
};

const isUnique = async (model, column, value, transaction) => {
    const found = await model.findOne({ where: { [column]: value }, transaction });
    return !found;
};

export const generateShipmentReference = async (transaction = null) => {
    const currentYear = new Date().getFullYear();
    let seq = await nextSequence(ShipmentModel, 'EXP', 'reference', currentYear, transaction);
    let reference = `EXP-${currentYear}-${pad(seq)}`;

    while (!(await isUnique(ShipmentModel, 'reference', reference, transaction))) {
        seq += 1;
        reference = `EXP-${currentYear}-${pad(seq)}`;
    }

    return reference;
};

export const generateTrackingNumber = async (transaction = null) => {
    let seq = await nextSequence(ParcelModel, 'LP', 'trackingNumber', null, transaction);
    let trackingNumber = `LP-${pad(seq)}`;

    while (!(await isUnique(ParcelModel, 'trackingNumber', trackingNumber, transaction))) {
        seq += 1;
        trackingNumber = `LP-${pad(seq)}`;
    }

    return trackingNumber;
};

export const generatePaymentReference = async (transaction = null) => {
    const currentYear = new Date().getFullYear();
    let seq = await nextSequence(PaymentModel, 'PAY', 'reference', currentYear, transaction);
    let reference = `PAY-${currentYear}-${pad(seq)}`;

    while (!(await isUnique(PaymentModel, 'reference', reference, transaction))) {
        seq += 1;
        reference = `PAY-${currentYear}-${pad(seq)}`;
    }

    return reference;
};

export const generateClientCode = async (transaction = null) => {
    let seq = await nextSequence(ClientModel, 'CL', 'clientCode', null, transaction);
    let clientCode = `CL-${pad(seq)}`;

    while (!(await isUnique(ClientModel, 'clientCode', clientCode, transaction))) {
        seq += 1;
        clientCode = `CL-${pad(seq)}`;
    }

    return clientCode;
};

export const generatePartnerRequestReference = async (transaction = null) => {
    const currentYear = new Date().getFullYear();
    let seq = await nextSequence(PartnerRequestModel, 'PART', 'reference', currentYear, transaction);
    let reference = `PART-${currentYear}-${pad(seq)}`;

    while (!(await isUnique(PartnerRequestModel, 'reference', reference, transaction))) {
        seq += 1;
        reference = `PART-${currentYear}-${pad(seq)}`;
    }

    return reference;
};

export const generateSubscriptionPaymentReference = async (transaction = null) => {
    const currentYear = new Date().getFullYear();
    let seq = await nextSequence(SubscriptionPaymentModel, 'SUBP', 'reference', currentYear, transaction);
    let reference = `SUBP-${currentYear}-${pad(seq)}`;

    while (!(await isUnique(SubscriptionPaymentModel, 'reference', reference, transaction))) {
        seq += 1;
        reference = `SUBP-${currentYear}-${pad(seq)}`;
    }

    return reference;
};

export const generateReceiptNumber = async (transaction = null) => {
    let seq = await nextSequence(SubscriptionPaymentModel, 'SRV', 'receiptNumber', null, transaction);
    let receipt = `SRV-${pad(seq)}`;

    while (!(await isUnique(SubscriptionPaymentModel, 'receiptNumber', receipt, transaction))) {
        seq += 1;
        receipt = `SRV-${pad(seq)}`;
    }

    return receipt;
};

export const generateInvoiceNumber = async (transaction = null) => {
    const currentYear = new Date().getFullYear();
    let seq = await nextSequence(InvoiceModel, 'FAC', 'invoiceNumber', currentYear, transaction);
    let invoiceNumber = `FAC-${currentYear}-${pad(seq)}`;

    while (!(await isUnique(InvoiceModel, 'invoiceNumber', invoiceNumber, transaction))) {
        seq += 1;
        invoiceNumber = `FAC-${currentYear}-${pad(seq)}`;
    }

    return invoiceNumber;
};
