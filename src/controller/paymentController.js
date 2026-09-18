import sequelize from "../../config/sequelize_app.js";
import PaymentModel from "../model/PaymentModel.js";
import ShipmentModel from "../model/ShipmentModel.js";
import ClientModel from "../model/ClientModel.js";
import CompanyModel from "../model/CompanyModel.js";
import AgencyModel from "../model/AgencyModel.js";
import {generatePaymentReference} from "../helper/reference.js";
import {paymentQuerySchema} from "../schema/paymentSchema.js";

const paymentIncludes = () => [
    { model: ShipmentModel, as: 'shipment' },
    { model: ClientModel, as: 'client' },
    { model: CompanyModel, as: 'company' },
    { model: AgencyModel, as: 'agency' }
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const recomputeShipmentPayment = async (shipment, deltaAmount, transaction) => {
    const paidAmount = clamp(
        Math.round((shipment.paidAmount + deltaAmount) * 100) / 100,
        0,
        shipment.totalAmount
    );
    const paymentStatus = paidAmount >= shipment.totalAmount ? 'paid' : 'pending';

    await shipment.update({ paidAmount, paymentStatus }, { transaction });

    return { paidAmount, paymentStatus };
};

const buildHistoryEntry = (status, comment = null) => ({
    status,
    date: new Date().toISOString(),
    description: comment || `Paiement ${status === 'paid' ? 'confirmé' : status === 'pending' ? 'initié' : status === 'refunded' ? 'remboursé' : 'échoué'}`
});

const appendHistory = async (payment, entry, transaction) => {
    const history = Array.isArray(payment.history) ? payment.history : [];
    await payment.update({ history: [...history, entry] }, { transaction });
};

const getStatusDelta = (fromStatus, toStatus) => {
    if (fromStatus === toStatus) return 0;
    if (toStatus === 'paid') return 1;
    if (fromStatus === 'paid') return -1;
    return 0;
};

export const createPayment = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const body = req.body;

        const shipment = await ShipmentModel.findByPk(body.shipmentId);
        if (!shipment) return res.status(400).json({ message: 'Expédition introuvable' });

        if (shipment.status === 'cancelled') {
            return res.status(400).json({ message: "Impossible d'enregistrer un paiement sur une expédition annulée" });
        }

        const reference = await generatePaymentReference(transaction);

        const status = body.status || 'pending';
        const history = [buildHistoryEntry(status, body.comment)];

        const payment = await PaymentModel.create({
            reference,
            shipmentId: shipment.id,
            clientId: shipment.clientId,
            companyId: shipment.companyId,
            agencyId: body.agencyId || shipment.agencyId || null,
            agentId: req.user?.employeeId || body.agentId || null,
            amount: body.amount,
            method: body.method || 'cash',
            status,
            transactionId: body.transactionId || null,
            history
        }, { transaction });

        let paidAmount = shipment.paidAmount;
        let paymentStatus = shipment.paymentStatus;

        if (status === 'paid') {
            const result = await recomputeShipmentPayment(shipment, body.amount, transaction);
            paidAmount = result.paidAmount;
            paymentStatus = result.paymentStatus;
        }

        await transaction.commit();

        return res.status(201).json({
            payment: await PaymentModel.findByPk(payment.id, { include: paymentIncludes() }),
            shipment: { id: shipment.id, paidAmount, paymentStatus },
            message: `Paiement ${reference} enregistré`
        });
    }
    catch (error) {
        if (transaction.finished !== 'commit') await transaction.rollback();
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getPayments = async (req, res) => {
    try {
        const { error, value } = paymentQuerySchema.validate(req.query, { abortEarly: true, stripUnknown: true });
        if (error) return res.status(400).json({ message: error.details[0].message });

        const where = {};
        if (value.clientId) where.clientId = value.clientId;
        if (value.shipmentId) where.shipmentId = value.shipmentId;
        if (value.agencyId) where.agencyId = value.agencyId;
        if (value.companyId) where.companyId = value.companyId;
        if (value.status) where.status = value.status;
        if (value.method) where.method = value.method;
        if (value.dateFrom || value.dateTo) {
            where.createdAt = {};
            if (value.dateFrom) where.createdAt[sequelize.Sequelize.Op.gte] = value.dateFrom;
            if (value.dateTo) where.createdAt[sequelize.Sequelize.Op.lte] = value.dateTo;
        }

        const page = Math.max(parseInt(value.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(value.limit, 10) || 20, 1), 100);
        const offset = (page - 1) * limit;

        const { rows, count } = await PaymentModel.findAndCountAll({
            where,
            include: paymentIncludes(),
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true
        });

        return res.status(200).json({
            payments: rows,
            total: count,
            page,
            limit
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getPayment = async (req, res) => {
    try {
        const payment = await PaymentModel.findByPk(req.params.id, { include: paymentIncludes() });
        if (!payment) return res.status(404).json({ message: 'Paiement introuvable' });
        return res.status(200).json({ payment });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getShipmentPayments = async (req, res) => {
    try {
        const shipment = await ShipmentModel.findByPk(req.params.id);
        if (!shipment) return res.status(404).json({ message: 'Expédition introuvable' });

        const payments = await PaymentModel.findAll({
            where: { shipmentId: shipment.id },
            include: paymentIncludes(),
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({ payments });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updatePaymentStatus = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const payment = await PaymentModel.findByPk(req.params.id, { transaction });
        if (!payment) return res.status(404).json({ message: 'Paiement introuvable' });

        const newStatus = req.body.status;
        const previousStatus = payment.status;

        if (previousStatus === newStatus) {
            return res.status(400).json({ message: `Le paiement est déjà au statut ${newStatus}` });
        }

        const shipment = await ShipmentModel.findByPk(payment.shipmentId, { transaction });
        if (!shipment) return res.status(404).json({ message: 'Expédition introuvable' });

        const delta = getStatusDelta(previousStatus, newStatus) * payment.amount;

        await payment.update({ status: newStatus }, { transaction });
        await appendHistory(payment, buildHistoryEntry(newStatus), transaction);

        let result = null;
        if (delta !== 0) {
            result = await recomputeShipmentPayment(shipment, delta, transaction);
        }

        await transaction.commit();

        return res.status(200).json({
            payment: await PaymentModel.findByPk(payment.id, { include: paymentIncludes() }),
            shipment: result
                ? { id: shipment.id, ...result }
                : { id: shipment.id, paidAmount: shipment.paidAmount, paymentStatus: shipment.paymentStatus },
            message: `Statut du paiement mis à jour`
        });
    }
    catch (error) {
        await transaction.rollback();
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
