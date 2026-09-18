import {Op} from 'sequelize';
import SubscriptionModel from '../model/SubscriptionModel.js';
import PlanModel from '../model/PlanModel.js';
import CompanyModel from '../model/CompanyModel.js';
import EmployeeModel from '../model/EmployeeModel.js';
import ClientModel from '../model/ClientModel.js';
import AgencyModel from '../model/AgencyModel.js';
import ShipmentModel from '../model/ShipmentModel.js';
import SubscriptionPaymentModel from '../model/SubscriptionPaymentModel.js';
import InvoiceModel from '../model/InvoiceModel.js';
import {ROLES} from '../../config/app.js';

const subscriptionIncludes = () => [
    { model: PlanModel, as: 'planDetail', attributes: ['id', 'code', 'name', 'price', 'currency', 'billingCycle', 'maxAgencies', 'maxUsers', 'maxStorage', 'maxShipments', 'features', 'description'] },
    { model: CompanyModel, as: 'company', attributes: ['id', 'name', 'city', 'status'] }
];

export const resolveUserCompanyId = async (userId) => {
    const employee = await EmployeeModel.findOne({ where: { userId }, attributes: ['companyId'] });
    if (employee) return employee.companyId;
    const client = await ClientModel.findOne({ where: { userId }, attributes: ['companyId'] });
    if (client) return client.companyId;
    return null;
};

const isOwnerOrRoot = (req, subscription) => {
    if (req.user.roles === ROLES.ROOT) return true;
    return req.requesterCompanyId === subscription.companyId;
};

const assertPlanExists = async (planCode) => {
    if (!planCode) return;
    const plan = await PlanModel.findOne({ where: { code: planCode } });
    if (!plan) throw { status: 400, message: 'Plan inexistant' };
};

export const createSubscription = async (req, res) => {
    try {
        const exist = await SubscriptionModel.findOne({ where: { companyId: req.body.companyId } });
        if (exist) return res.status(400).json({ message: 'Cette compagnie possède déjà un abonnement' });

        try {
            await assertPlanExists(req.body.plan);
        }
        catch (e) {
            if (e.status) return res.status(e.status).json({ message: e.message });
            throw e;
        }

        const subscription = await SubscriptionModel.create(req.body);

        return res.status(201).json({
            subscription: await SubscriptionModel.findByPk(subscription.id, { include: subscriptionIncludes() }),
            message: 'Abonnement créé avec succès'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getSubscriptions = async (req, res) => {
    try {
        const { status, plan, companyId, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (plan) where.plan = plan;
        if (companyId) where.companyId = companyId;

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.max(parseInt(limit, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await SubscriptionModel.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
            include: subscriptionIncludes()
        });

        return res.status(200).json({ subscriptions: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getSubscription = async (req, res) => {
    try {
        const subscription = await SubscriptionModel.findByPk(req.params.id, { include: subscriptionIncludes() });
        if (!subscription) return res.status(404).json({ message: 'Abonnement introuvable' });
        return res.status(200).json({ subscription });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateSubscription = async (req, res) => {
    try {
        const subscription = await SubscriptionModel.findByPk(req.params.id);
        if (!subscription) return res.status(404).json({ message: 'Abonnement introuvable' });

        if (req.body.companyId) {
            const exist = await SubscriptionModel.findOne({
                where: { companyId: req.body.companyId, id: { [Op.ne]: subscription.id } }
            });
            if (exist) return res.status(400).json({ message: 'Cette compagnie possède déjà un abonnement' });
        }

        try {
            await assertPlanExists(req.body.plan);
        }
        catch (e) {
            if (e.status) return res.status(e.status).json({ message: e.message });
            throw e;
        }

        await subscription.update(req.body);

        return res.status(200).json({
            subscription: await SubscriptionModel.findByPk(subscription.id, { include: subscriptionIncludes() }),
            message: 'Abonnement mis à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deleteSubscription = async (req, res) => {
    try {
        const subscription = await SubscriptionModel.findByPk(req.params.id);
        if (!subscription) return res.status(404).json({ message: 'Abonnement introuvable' });

        await subscription.destroy();

        return res.status(200).json({ message: 'Abonnement supprimé' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

const computeUsage = async (subscription) => {
    const plan = subscription.planDetail || await PlanModel.findOne({ where: { code: subscription.plan } }) || null;
    const companyId = subscription.companyId;

    const [agenciesUsed, usersUsed, shipmentsUsed] = await Promise.all([
        AgencyModel.count({ where: { companyId } }),
        EmployeeModel.count({ where: { companyId } }),
        ShipmentModel.count({ where: { companyId } })
    ]);

    return {
        agencies: { used: agenciesUsed, max: plan?.maxAgencies ?? -1 },
        users: { used: usersUsed, max: plan?.maxUsers ?? -1 },
        storage: { used: 0, max: plan?.maxStorage ?? 0, unit: 'GB' },
        shipments: { used: shipmentsUsed, max: plan?.maxShipments ?? -1, period: 'Au total' }
    };
};

export const getSubscriptionUsage = async (req, res) => {
    try {
        req.requesterCompanyId = await resolveUserCompanyId(req.user.id);
        const subscription = await SubscriptionModel.findByPk(req.params.id, { include: subscriptionIncludes() });
        if (!subscription) return res.status(404).json({ message: 'Abonnement introuvable' });

        if (!isOwnerOrRoot(req, subscription)) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        const quotas = await computeUsage(subscription);

        return res.status(200).json({ subscription, quotas });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getSubscriptionPayments = async (req, res) => {
    try {
        req.requesterCompanyId = await resolveUserCompanyId(req.user.id);
        const subscription = await SubscriptionModel.findByPk(req.params.id);
        if (!subscription) return res.status(404).json({ message: 'Abonnement introuvable' });

        if (!isOwnerOrRoot(req, subscription)) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        const { status, page = 1, limit = 20 } = req.query;
        const where = { subscriptionId: subscription.id };
        if (status) where.status = status;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await SubscriptionPaymentModel.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
            include: [{ model: InvoiceModel, as: 'invoices', attributes: ['id', 'invoiceNumber', 'totalAmount', 'status', 'paidAt'] }]
        });

        return res.status(200).json({ payments: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getSubscriptionInvoices = async (req, res) => {
    try {
        req.requesterCompanyId = await resolveUserCompanyId(req.user.id);
        const subscription = await SubscriptionModel.findByPk(req.params.id);
        if (!subscription) return res.status(404).json({ message: 'Abonnement introuvable' });

        if (!isOwnerOrRoot(req, subscription)) {
            return res.status(403).json({ message: 'Accès refusé' });
        }

        const { status, page = 1, limit = 20 } = req.query;
        const where = { subscriptionId: subscription.id };
        if (status) where.status = status;

        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await InvoiceModel.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset
        });

        return res.status(200).json({ invoices: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
