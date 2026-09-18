import {Op} from 'sequelize';
import RouteModel from '../model/RouteModel.js';
import AgencyModel from '../model/AgencyModel.js';

const routeIncludes = () => [
    { model: AgencyModel, as: 'originAgency' },
    { model: AgencyModel, as: 'destinationAgency' }
];

export const createRoute = async (req, res) => {
    try {
        const route = await RouteModel.create(req.body);

        return res.status(201).json({
            route: await RouteModel.findByPk(route.id, { include: routeIncludes() }),
            message: 'Route créée avec succès'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getRoutes = async (req, res) => {
    try {
        const { status, search, companyId, originAgencyId, destinationAgencyId, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (companyId) where.companyId = companyId;
        if (originAgencyId) where.originAgencyId = originAgencyId;
        if (destinationAgencyId) where.destinationAgencyId = destinationAgencyId;
        if (search) {
            where[Op.or] = [
                { vehicle: { [Op.like]: `%${search}%` } },
                { driver: { [Op.like]: `%${search}%` } }
            ];
        }

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.max(parseInt(limit, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await RouteModel.findAndCountAll({
            where,
            include: routeIncludes(),
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
            distinct: true
        });

        return res.status(200).json({ routes: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getRoute = async (req, res) => {
    try {
        const route = await RouteModel.findByPk(req.params.id, { include: routeIncludes() });
        if (!route) return res.status(404).json({ message: 'Route introuvable' });
        return res.status(200).json({ route });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateRoute = async (req, res) => {
    try {
        const route = await RouteModel.findByPk(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route introuvable' });

        await route.update(req.body);

        return res.status(200).json({
            route: await RouteModel.findByPk(route.id, { include: routeIncludes() }),
            message: 'Route mise à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deleteRoute = async (req, res) => {
    try {
        const route = await RouteModel.findByPk(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route introuvable' });

        await route.destroy();

        return res.status(200).json({ message: 'Route supprimée' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
