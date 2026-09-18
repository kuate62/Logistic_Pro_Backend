import {Op} from 'sequelize';
import AgencyModel from '../model/AgencyModel.js';
import CompanyModel from '../model/CompanyModel.js';
import EmployeeModel from '../model/EmployeeModel.js';
import ShipmentModel from '../model/ShipmentModel.js';
import PaymentModel from '../model/PaymentModel.js';

const agencyIncludes = () => [
    { model: CompanyModel, as: 'company' },
    { model: EmployeeModel, as: 'employees' }
];

const getEntityId = (req) => parseInt(req.body.id ?? req.params.id, 10);

export const createAgency = async (req, res) => {
    try {
        const company = await CompanyModel.findByPk(req.body.companyId);
        if (!company) return res.status(400).json({ message: 'Compagnie introuvable' });

        const agency = await AgencyModel.create(req.body);

        return res.status(201).json({
            agency: await AgencyModel.findByPk(agency.id, { include: agencyIncludes() }),
            message: 'Agence créée avec succès'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getAgencies = async (req, res) => {
    try {
        const { companyId, city, status, search, page = 1, limit = 20 } = req.query;

        const where = {};
        if (companyId) where.companyId = companyId;
        if (city) where.city = city;
        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { city: { [Op.like]: `%${search}%` } },
                { region: { [Op.like]: `%${search}%` } }
            ];
        }

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.max(parseInt(limit, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await AgencyModel.findAndCountAll({
            where,
            include: [{ model: CompanyModel, as: 'company' }],
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
            distinct: true
        });

        return res.status(200).json({ agencies: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getAgency = async (req, res) => {
    try {
        const agency = await AgencyModel.findByPk(req.params.id, { include: agencyIncludes() });
        if (!agency) return res.status(404).json({ message: 'Agence introuvable' });
        return res.status(200).json({ agency });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateAgency = async (req, res) => {
    try {
        const id = getEntityId(req);
        const agency = await AgencyModel.findByPk(id);
        if (!agency) return res.status(404).json({ message: 'Agence introuvable' });

        if (req.body.companyId) {
            const company = await CompanyModel.findByPk(req.body.companyId);
            if (!company) return res.status(400).json({ message: 'Compagnie introuvable' });
        }

        await agency.update(req.body);

        return res.status(200).json({
            agency: await AgencyModel.findByPk(id, { include: agencyIncludes() }),
            message: 'Agence mise à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deleteAgency = async (req, res) => {
    try {
        const agency = await AgencyModel.findByPk(req.params.id);
        if (!agency) return res.status(404).json({ message: 'Agence introuvable' });

        const [employees, originShipments, destinationShipments, payments] = await Promise.all([
            EmployeeModel.count({ where: { agencyId: agency.id } }),
            ShipmentModel.count({ where: { agencyId: agency.id } }),
            ShipmentModel.count({ where: { destinationAgencyId: agency.id } }),
            PaymentModel.count({ where: { agencyId: agency.id } })
        ]);

        const total = employees + originShipments + destinationShipments + payments;
        if (total > 0) {
            return res.status(400).json({
                message: `Impossible de supprimer : l'agence possède ${total} élément(s) lié(s) (employés, expéditions, paiements).`
            });
        }

        await agency.destroy();

        return res.status(200).json({ message: 'Agence supprimée' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
