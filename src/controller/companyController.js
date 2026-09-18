import {Op} from 'sequelize';
import CompanyModel from '../model/CompanyModel.js';
import AgencyModel from '../model/AgencyModel.js';
import ClientModel from '../model/ClientModel.js';
import EmployeeModel from '../model/EmployeeModel.js';
import ShipmentModel from '../model/ShipmentModel.js';
import PaymentModel from '../model/PaymentModel.js';
import ParcelModel from '../model/ParcelModel.js';
import TrackingEventModel from '../model/TrackingEventModel.js';

const companyIncludes = () => [
    { model: AgencyModel, as: 'agencies' },
    { model: ClientModel, as: 'clients' }
];

const getEntityId = (req) => parseInt(req.body.id ?? req.params.id, 10);

export const createCompany = async (req, res) => {
    try {
        if (req.body.slug) {
            const exist = await CompanyModel.findOne({ where: { slug: req.body.slug } });
            if (exist) return res.status(400).json({ message: 'Ce slug est déjà utilisé' });
        }

        const company = await CompanyModel.create(req.body);

        return res.status(201).json({
            company: await CompanyModel.findByPk(company.id, { include: companyIncludes() }),
            message: 'Compagnie créée avec succès'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getCompanies = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { city: { [Op.like]: `%${search}%` } },
                { slug: { [Op.like]: `%${search}%` } }
            ];
        }

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.max(parseInt(limit, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await CompanyModel.findAndCountAll({
            where,
            include: companyIncludes(),
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
            distinct: true
        });

        return res.status(200).json({ companies: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getCompany = async (req, res) => {
    try {
        const company = await CompanyModel.findByPk(req.params.id, { include: companyIncludes() });
        if (!company) return res.status(404).json({ message: 'Compagnie introuvable' });
        return res.status(200).json({ company });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateCompany = async (req, res) => {
    try {
        const id = getEntityId(req);
        const company = await CompanyModel.findByPk(id);
        if (!company) return res.status(404).json({ message: 'Compagnie introuvable' });

        if (req.body.slug) {
            const exist = await CompanyModel.findOne({ where: { slug: req.body.slug, id: { [Op.ne]: id } } });
            if (exist) return res.status(400).json({ message: 'Ce slug est déjà utilisé' });
        }

        await company.update(req.body);

        return res.status(200).json({
            company: await CompanyModel.findByPk(id, { include: companyIncludes() }),
            message: 'Compagnie mise à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deleteCompany = async (req, res) => {
    try {
        const company = await CompanyModel.findByPk(req.params.id);
        if (!company) return res.status(404).json({ message: 'Compagnie introuvable' });

        const [agencies, clients, employees, shipments, payments] = await Promise.all([
            AgencyModel.count({ where: { companyId: company.id } }),
            ClientModel.count({ where: { companyId: company.id } }),
            EmployeeModel.count({ where: { companyId: company.id } }),
            ShipmentModel.count({ where: { companyId: company.id } }),
            PaymentModel.count({ where: { companyId: company.id } })
        ]);

        const total = agencies + clients + employees + shipments + payments;
        if (total > 0) {
            return res.status(400).json({
                message: `Impossible de supprimer : la compagnie possède ${total} élément(s) lié(s) (agences, clients, employés, expéditions, paiements).`
            });
        }

        await company.destroy();

        return res.status(200).json({ message: 'Compagnie supprimée' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getCompanyDashboardStats = async (req, res) => {
    try {
        const companyId = parseInt(req.params.id, 10);
        const company = await CompanyModel.findByPk(companyId);
        if (!company) return res.status(404).json({ message: 'Compagnie introuvable' });

        const statusList = ['validated', 'preparing', 'assigned', 'in_transit', 'arrived', 'available_pickup', 'delivered', 'cancelled'];
        const statusCountsPromises = statusList.map(st => ShipmentModel.count({ where: { companyId, status: st } }));

        const [
            totalShipments,
            totalPackages,
            totalAgencies,
            totalEmployees,
            totalClients,
            totalRevenueResult,
            pendingShipments,
            inTransitShipments,
            deliveredShipments,
            recentPayments,
            recentShipments,
            recentParcels,
            ...statusCountsResults
        ] = await Promise.all([
            ShipmentModel.count({ where: { companyId } }),
            ParcelModel.count({ where: { companyId } }),
            AgencyModel.count({ where: { companyId } }),
            EmployeeModel.count({ where: { companyId } }),
            ClientModel.count({ where: { companyId } }),
            PaymentModel.sum('amount', { where: { companyId, status: 'paid' } }),
            ShipmentModel.count({ where: { companyId, status: ['validated', 'preparing', 'assigned'] } }),
            ShipmentModel.count({ where: { companyId, status: 'in_transit' } }),
            ShipmentModel.count({ where: { companyId, status: 'delivered' } }),
            PaymentModel.findAll({
                where: { companyId },
                order: [['createdAt', 'DESC']],
                limit: 5,
                include: [
                    { model: ShipmentModel, as: 'shipment' },
                    { model: ClientModel, as: 'client' }
                ]
            }),
            ShipmentModel.findAll({
                where: { companyId },
                order: [['createdAt', 'DESC']],
                limit: 5,
                include: [
                    { model: ClientModel, as: 'client' },
                    { model: AgencyModel, as: 'originAgency' },
                    { model: AgencyModel, as: 'destinationAgency' }
                ]
            }),
            ParcelModel.findAll({
                where: { companyId },
                order: [['updatedAt', 'DESC']],
                limit: 8,
                include: [
                    {
                        model: ShipmentModel,
                        as: 'shipment',
                        include: [
                            { model: AgencyModel, as: 'destinationAgency' },
                        ]
                    },
                    { model: TrackingEventModel, as: 'tracking' }
                ]
            }),
            ...statusCountsPromises
        ]);

        const statusCounts = {};
        statusList.forEach((st, idx) => {
            statusCounts[st] = statusCountsResults[idx] || 0;
        });

        const totalRevenue = totalRevenueResult || 0;
        const totalPaid = totalRevenue;

        return res.status(200).json({
            kpis: {
                totalShipments,
                totalPackages,
                totalAgencies,
                totalEmployees,
                totalClients,
                totalRevenue,
                totalPaid,
                pendingShipments,
                inTransitShipments,
                deliveredShipments,
                statusCounts
            },
            recentPayments,
            recentShipments,
            recentParcels
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
