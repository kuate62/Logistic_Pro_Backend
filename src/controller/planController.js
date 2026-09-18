import {Op} from 'sequelize';
import PlanModel from '../model/PlanModel.js';
import SubscriptionModel from '../model/SubscriptionModel.js';

const slugify = (value) => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);

const findPlanByIdentifier = async (identifier) => {
    const idNum = parseInt(identifier, 10);
    if (Number.isInteger(idNum) && String(idNum) === String(identifier)) {
        return PlanModel.findByPk(idNum);
    }
    return PlanModel.findOne({ where: { code: identifier } });
};

export const createPlan = async (req, res) => {
    try {
        const data = { ...req.body };
        if (!data.code) data.code = slugify(data.name);

        const exist = await PlanModel.findOne({ where: { code: data.code } });
        if (exist) return res.status(400).json({ message: 'Un plan avec ce code existe déjà' });

        const plan = await PlanModel.create(data);

        return res.status(201).json({
            plan: await PlanModel.findByPk(plan.id),
            message: 'Plan créé avec succès'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getPlans = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 100 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { code: { [Op.like]: `%${search}%` } }
            ];
        }

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.max(parseInt(limit, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await PlanModel.findAndCountAll({
            where,
            order: [['price', 'ASC']],
            limit: limitNum,
            offset
        });

        return res.status(200).json({ plans: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getPlan = async (req, res) => {
    try {
        const plan = await findPlanByIdentifier(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan introuvable' });
        return res.status(200).json({ plan });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updatePlan = async (req, res) => {
    try {
        const plan = await findPlanByIdentifier(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan introuvable' });

        if (req.body.code && req.body.code !== plan.code) {
            const exist = await PlanModel.findOne({ where: { code: req.body.code, id: { [Op.ne]: plan.id } } });
            if (exist) return res.status(400).json({ message: 'Un plan avec ce code existe déjà' });
        }

        await plan.update(req.body);

        return res.status(200).json({
            plan: await PlanModel.findByPk(plan.id),
            message: 'Plan mis à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deletePlan = async (req, res) => {
    try {
        const plan = await findPlanByIdentifier(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan introuvable' });

        const used = await SubscriptionModel.count({ where: { plan: plan.code } });
        if (used > 0) return res.status(400).json({ message: `Impossible de supprimer ce plan : ${used} abonnement(s) l'utilisent` });

        await plan.destroy();

        return res.status(200).json({ message: 'Plan supprimé' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
