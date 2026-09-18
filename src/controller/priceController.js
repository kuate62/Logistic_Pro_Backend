import {Op} from 'sequelize';
import PriceModel from '../model/PriceModel.js';
import AgencyModel from '../model/AgencyModel.js';

const priceIncludes = () => [
    { model: AgencyModel, as: 'agency' }
];

export const createPrice = async (req, res) => {
    try {
        const price = await PriceModel.create(req.body);

        return res.status(201).json({
            price: await PriceModel.findByPk(price.id, { include: priceIncludes() }),
            message: 'Prix créé avec succès'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getPrices = async (req, res) => {
    try {
        const { status, category, companyId, agencyId, search, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (category) where.category = category;
        if (companyId) where.companyId = companyId;
        if (agencyId) where.agencyId = agencyId;
        if (search) {
            where[Op.or] = [
                { category: { [Op.like]: `%${search}%` } },
                { unit: { [Op.like]: `%${search}%` } }
            ];
        }

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.max(parseInt(limit, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await PriceModel.findAndCountAll({
            where,
            include: priceIncludes(),
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
            distinct: true
        });

        return res.status(200).json({ prices: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getPrice = async (req, res) => {
    try {
        const price = await PriceModel.findByPk(req.params.id, { include: priceIncludes() });
        if (!price) return res.status(404).json({ message: 'Prix introuvable' });
        return res.status(200).json({ price });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updatePrice = async (req, res) => {
    try {
        const price = await PriceModel.findByPk(req.params.id);
        if (!price) return res.status(404).json({ message: 'Prix introuvable' });

        await price.update(req.body);

        return res.status(200).json({
            price: await PriceModel.findByPk(price.id, { include: priceIncludes() }),
            message: 'Prix mis à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deletePrice = async (req, res) => {
    try {
        const price = await PriceModel.findByPk(req.params.id);
        if (!price) return res.status(404).json({ message: 'Prix introuvable' });

        await price.destroy();

        return res.status(200).json({ message: 'Prix supprimé' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
