import {Op} from 'sequelize';
import ClientModel from '../model/ClientModel.js';
import UserModel from '../model/UserModel.js';
import CompanyModel from '../model/CompanyModel.js';
import AgencyModel from '../model/AgencyModel.js';
import EmployeeModel from '../model/EmployeeModel.js';
import ShipmentModel from '../model/ShipmentModel.js';
import ParcelModel from '../model/ParcelModel.js';
import PaymentModel from '../model/PaymentModel.js';
import {generateClientCode} from '../helper/reference.js';

const clientIncludes = () => [
    { model: CompanyModel, as: 'company' },
    { model: AgencyModel, as: 'preferredAgency' }
];

const getEntityId = (req) => parseInt(req.body.id ?? req.params.id, 10);

export const createClient = async (req, res) => {
    try {
        // Sanitize empty email/phone/strings to null
        if (!req.body.email || req.body.email.trim() === '') {
            req.body.email = null;
        } else {
            req.body.email = req.body.email.trim().toLowerCase();
        }

        // Auto-resolve companyId from the authenticated employee if not provided
        if (!req.body.companyId && req.user?.id) {
            const emp = await EmployeeModel.findOne({ where: { userId: req.user.id } });
            if (emp?.companyId) req.body.companyId = emp.companyId;
        }

        // Auto-link to existing user account if email matches and userId is not already specified
        if (req.body.email && !req.body.userId) {
            const matchingUser = await UserModel.findOne({ where: { email: req.body.email } });
            if (matchingUser) {
                const userAlreadyLinked = await ClientModel.findOne({ where: { userId: matchingUser.id } });
                if (!userAlreadyLinked) {
                    req.body.userId = matchingUser.id;
                }
            }
        }

        if (req.body.userId) {
            const user = await UserModel.findByPk(req.body.userId);
            if (!user) return res.status(400).json({ message: 'Utilisateur introuvable' });

            const linkedClient = await ClientModel.findOne({ where: { userId: req.body.userId } });
            if (linkedClient) return res.status(400).json({ message: 'Cet utilisateur est déjà lié à un client' });
        }

        if (req.body.companyId) {
            const company = await CompanyModel.findByPk(req.body.companyId);
            if (!company) return res.status(400).json({ message: 'Compagnie introuvable' });
        }

        if (req.body.preferredAgencyId) {
            const agency = await AgencyModel.findByPk(req.body.preferredAgencyId);
            if (!agency) return res.status(400).json({ message: 'Agence introuvable' });
        }

        if (!req.body.clientCode) {
            req.body.clientCode = await generateClientCode();
        }

        const client = await ClientModel.create(req.body);

        return res.status(201).json({
            client: await ClientModel.findByPk(client.id, { include: clientIncludes() }),
            message: 'Client créé avec succès'
        });
    }
    catch (error) {
        // Handle Sequelize unique constraint violations with friendly messages
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors?.[0]?.path || '';
            if (field.includes('phone')) return res.status(400).json({ message: 'Ce numéro de téléphone est déjà associé à un client existant' });
            if (field.includes('email')) return res.status(400).json({ message: 'Cet email est déjà associé à un client existant' });
            if (field.includes('clientCode')) return res.status(400).json({ message: 'Code client déjà utilisé, veuillez réessayer' });
            return res.status(400).json({ message: 'Un doublon a été détecté. Vérifiez les informations saisies.' });
        }
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};


export const getClients = async (req, res) => {
    try {
        const { companyId, city, status, search, page = 1, limit = 20 } = req.query;

        const where = {};
        if (companyId) where.companyId = companyId;
        if (city) where.city = city;
        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
                { clientCode: { [Op.like]: `%${search}%` } }
            ];
        }

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.max(parseInt(limit, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await ClientModel.findAndCountAll({
            where,
            include: [{ model: CompanyModel, as: 'company' }],
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
            distinct: true
        });

        return res.status(200).json({ clients: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getMe = async (req, res) => {
    try {
        const client = await ClientModel.findOne({
            where: { userId: req.user.id },
            include: clientIncludes()
        });

        if (!client) return res.status(404).json({ message: 'Aucun profil client lié à votre compte' });

        return res.status(200).json({ client });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getClient = async (req, res) => {
    try {
        const client = await ClientModel.findByPk(req.params.id, { include: clientIncludes() });
        if (!client) return res.status(404).json({ message: 'Client introuvable' });
        return res.status(200).json({ client });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateMe = async (req, res) => {
    try {
        const client = await ClientModel.findOne({ where: { userId: req.user.id } });
        if (!client) return res.status(404).json({ message: 'Aucun profil client lié à votre compte' });

        if (req.body.preferredAgencyId != null) {
            const agency = await AgencyModel.findByPk(req.body.preferredAgencyId);
            if (!agency) return res.status(400).json({ message: 'Agence introuvable' });
        }

        const { userId, companyId, status, id, ...allowed } = req.body;
        await client.update(allowed);

        const user = await UserModel.findByPk(req.user.id);
        if (user) {
            const userFields = {};
            if (req.body.lastName) userFields.lastname = req.body.lastName;
            if (req.body.firstName) userFields.firstname = req.body.firstName;
            if (req.body.phone != null) userFields.phone = req.body.phone || null;
            if (req.body.email && req.body.email !== user.email) {
                const emailTaken = await UserModel.findOne({ where: { email: req.body.email, id: { [Op.ne]: user.id } } });
                if (emailTaken) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
                userFields.email = req.body.email;
            }
            if (Object.keys(userFields).length > 0) await user.update(userFields);
        }

        return res.status(200).json({
            client: await ClientModel.findByPk(client.id, { include: clientIncludes() }),
            message: 'Profil mis à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        const client = await ClientModel.findOne({ where: { userId: req.user.id } });
        if (!client) return res.status(404).json({ message: 'Aucun profil client lié à votre compte' });
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

        const avatar = `/uploads/avatars/${req.file.filename}`;
        await client.update({ avatar });

        return res.status(200).json({
            success: true,
            avatar,
            client: await ClientModel.findByPk(client.id, { include: clientIncludes() })
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateClient = async (req, res) => {
    try {
        const id = getEntityId(req);
        const client = await ClientModel.findByPk(id);
        if (!client) return res.status(404).json({ message: 'Client introuvable' });

        if (req.body.userId) {
            const user = await UserModel.findByPk(req.body.userId);
            if (!user) return res.status(400).json({ message: 'Utilisateur introuvable' });

            const linkedClient = await ClientModel.findOne({ where: { userId: req.body.userId, id: { [Op.ne]: id } } });
            if (linkedClient) return res.status(400).json({ message: 'Cet utilisateur est déjà lié à un client' });
        }

        if (req.body.companyId) {
            const company = await CompanyModel.findByPk(req.body.companyId);
            if (!company) return res.status(400).json({ message: 'Compagnie introuvable' });
        }

        if (req.body.preferredAgencyId != null) {
            const agency = await AgencyModel.findByPk(req.body.preferredAgencyId);
            if (!agency) return res.status(400).json({ message: 'Agence introuvable' });
        }

        await client.update(req.body);

        return res.status(200).json({
            client: await ClientModel.findByPk(id, { include: clientIncludes() }),
            message: 'Client mis à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deleteClient = async (req, res) => {
    try {
        const client = await ClientModel.findByPk(req.params.id);
        if (!client) return res.status(404).json({ message: 'Client introuvable' });

        const [shipments, parcels, payments] = await Promise.all([
            ShipmentModel.count({ where: { clientId: client.id } }),
            ParcelModel.count({ where: { clientId: client.id } }),
            PaymentModel.count({ where: { clientId: client.id } })
        ]);

        const total = shipments + parcels + payments;
        if (total > 0) {
            return res.status(400).json({
                message: `Impossible de supprimer : le client possède ${total} élément(s) lié(s) (expéditions, colis, paiements).`
            });
        }

        await client.destroy();

        return res.status(200).json({ message: 'Client supprimé' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
