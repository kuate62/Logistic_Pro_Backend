import {Op} from 'sequelize';
import UserModel from '../model/UserModel.js';
import EmployeeModel from '../model/EmployeeModel.js';
import CompanyModel from '../model/CompanyModel.js';
import {ROLES} from '../../config/app.js';

const userIncludes = () => [
    {
        model: EmployeeModel,
        as: 'employeeProfile',
        attributes: ['id', 'companyId', 'agencyId', 'role'],
        include: [{ model: CompanyModel, as: 'company', attributes: ['id', 'name', 'slug'] }]
    }
];

export const createUser = async (req, res) => {
    try {
        if (req.body.roles === ROLES.ROOT && req.user.roles !== ROLES.ROOT) {
            return res.status(403).json({ message: 'Seul un SuperAdmin peut créer ou attribuer le rôle SuperAdmin' });
        }

        const existEmail = await UserModel.findOne({ where: { email: req.body.email } });
        if (existEmail) return res.status(400).json({ message: 'Cet email est déjà utilisé' });

        let existPhone = null;
        if (req.body.phone) {
            existPhone = await UserModel.findOne({ where: { phone: req.body.phone } });
            if (existPhone) return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
        }

        const user = await UserModel.create(req.body);

        return res.status(201).json({
            user: await UserModel.findByPk(user.id, { include: userIncludes() }),
            message: 'Utilisateur créé avec succès'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const { search, roles, status, page = 1, limit = 20 } = req.query;

        const where = {};
        if (roles) where.roles = roles;
        if (status !== undefined && status !== '') where.status = status === 'true';
        if (search) {
            where[Op.or] = [
                { firstname: { [Op.like]: `%${search}%` } },
                { lastname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.max(parseInt(limit, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await UserModel.findAndCountAll({
            where,
            include: userIncludes(),
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset
        });

        return res.status(200).json({ users: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.params.id, { include: userIncludes() });
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
        return res.status(200).json({ user });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

        if (req.body.roles === ROLES.ROOT && req.user.roles !== ROLES.ROOT) {
            return res.status(403).json({ message: 'Seul un SuperAdmin peut attribuer le rôle SuperAdmin' });
        }

        if (req.body.email) {
            const exist = await UserModel.findOne({ where: { email: req.body.email, id: { [Op.ne]: user.id } } });
            if (exist) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        if (req.body.phone) {
            const exist = await UserModel.findOne({ where: { phone: req.body.phone, id: { [Op.ne]: user.id } } });
            if (exist) return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
        }

        await user.update(req.body);

        return res.status(200).json({
            user: await UserModel.findByPk(user.id, { include: userIncludes() }),
            message: 'Utilisateur mis à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

        await user.destroy();

        return res.status(200).json({ message: 'Utilisateur supprimé' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

