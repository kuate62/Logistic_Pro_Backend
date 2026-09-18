import SubscriptionModel from '../model/SubscriptionModel.js';
import PlanModel from '../model/PlanModel.js';
import SubscriptionPaymentModel from '../model/SubscriptionPaymentModel.js';
import InvoiceModel from '../model/InvoiceModel.js';
import {
    generateSubscriptionPaymentReference,
    generateReceiptNumber,
    generateInvoiceNumber
} from '../helper/reference.js';

const TAX_RATE = 0.18;

export const createSubscriptionPayment = async (req, res) => {
    try {
        const subscription = await SubscriptionModel.findByPk(req.params.id);
        if (!subscription) return res.status(404).json({ message: 'Abonnement introuvable' });

        const plan = await PlanModel.findOne({ where: { code: subscription.plan } });

        const data = { ...req.body };
        if (data.amount === undefined || data.amount === null) {
            data.amount = plan ? plan.price : 0;
        }
        data.currency = data.currency || 'FCFA';

        const transaction = await SubscriptionModel.sequelize.transaction();

        try {
            const reference = await generateSubscriptionPaymentReference(transaction);
            const receiptNumber = await generateReceiptNumber(transaction);

            const status = data.status || 'pending';
            const paidAt = status === 'paid' ? new Date() : null;

            const payment = await SubscriptionPaymentModel.create({
                subscriptionId: subscription.id,
                companyId: subscription.companyId,
                reference,
                receiptNumber,
                amount: data.amount,
                currency: data.currency,
                paymentMethod: data.paymentMethod || null,
                status,
                periodStart: data.periodStart || null,
                periodEnd: data.periodEnd || null,
                paidAt
            }, { transaction });

            const invoiceNumber = await generateInvoiceNumber(transaction);
            const taxAmount = Math.round(data.amount * TAX_RATE * 100) / 100;

            const invoice = await InvoiceModel.create({
                subscriptionId: subscription.id,
                subscriptionPaymentId: payment.id,
                companyId: subscription.companyId,
                invoiceNumber,
                amount: data.amount,
                taxRate: TAX_RATE,
                taxAmount,
                totalAmount: Math.round((data.amount + taxAmount) * 100) / 100,
                status: status === 'paid' ? 'paid' : 'pending',
                dueDate: data.periodEnd || null,
                paidAt
            }, { transaction });

            await transaction.commit();

            return res.status(201).json({
                payment: await SubscriptionPaymentModel.findByPk(payment.id, {
                    include: [{ model: InvoiceModel, as: 'invoices' }]
                }),
                invoice: await InvoiceModel.findByPk(invoice.id),
                message: 'Paiement enregistré'
            });
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateSubscriptionPaymentStatus = async (req, res) => {
    try {
        const payment = await SubscriptionPaymentModel.findOne({
            where: { id: req.params.paymentId, subscriptionId: req.params.id }
        });
        if (!payment) return res.status(404).json({ message: 'Paiement introuvable' });

        const { status } = req.body;

        const transition = `${payment.status} → ${status}`;
        if (status === payment.status) return res.status(400).json({ message: 'Statut identique' });

        const allowed = {
            'pending → paid': true,
            'pending → failed': true,
            'pending → refunded': true,
            'paid → refunded': true,
            'paid → failed': true
        };
        if (!allowed[transition]) return res.status(400).json({ message: `Transition invalide (${transition})` });

        const transaction = await SubscriptionModel.sequelize.transaction();

        try {
            const paidAt = status === 'paid' ? new Date() : null;
            await payment.update({ status, paidAt }, { transaction });

            if (status === 'paid') {
                await InvoiceModel.update({ status: 'paid', paidAt }, { where: { subscriptionPaymentId: payment.id }, transaction });
            }
            else if (status === 'refunded' || status === 'failed') {
                await InvoiceModel.update({ status: 'pending' }, { where: { subscriptionPaymentId: payment.id, status: 'paid' }, transaction });
            }

            await transaction.commit();

            return res.status(200).json({
                payment: await SubscriptionPaymentModel.findByPk(payment.id, {
                    include: [{ model: InvoiceModel, as: 'invoices' }]
                }),
                message: 'Statut de paiement mis à jour'
            });
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
