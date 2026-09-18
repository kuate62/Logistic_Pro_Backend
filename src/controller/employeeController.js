import {Op} from 'sequelize';
import EmployeeModel from '../model/EmployeeModel.js';
import AgencyModel from '../model/AgencyModel.js';
import ShipmentModel from '../model/ShipmentModel.js';
import PaymentModel from '../model/PaymentModel.js';
import UserModel from '../model/UserModel.js';
import {ROLES} from "../../config/app.js";

const employeeIncludes = () => [
    { model: AgencyModel, as: 'agency' }
];

export const createEmployee = async (req, res) => {
    try {
        if (req.body.email) {
            const exist = await EmployeeModel.findOne({ where: { email: req.body.email } });
            if (exist) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        if (req.body.userId) {
            const user = await UserModel.findByPk(req.body.userId);
            if (!user) return res.status(400).json({ message: 'Utilisateur introuvable' });

            const linkedEmployee = await EmployeeModel.findOne({ where: { userId: req.body.userId } });
            if (linkedEmployee) return res.status(400).json({ message: 'Cet utilisateur est déjà lié à un employé' });
        }

        if (req.body.createUser) {
            if (!req.body.email) return res.status(400).json({ message: 'Un email est requis pour créer le compte' });
            if (!req.body.password) return res.status(400).json({ message: 'Le mot de passe est requis pour créer le compte' });
            const existingUser = await UserModel.findOne({ where: { email: req.body.email } });
            if (existingUser) return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
            const user = await UserModel.create({
                firstname: req.body.firstName,
                lastname: req.body.lastName,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone || null,
                roles: ROLES.USER,
                status: true,
                verified: true
            });
            req.body.userId = user.id;
        }

        delete req.body.createUser;
        delete req.body.password;

        const employee = await EmployeeModel.create(req.body);

        return res.status(201).json({
            employee: await EmployeeModel.findByPk(employee.id, { include: employeeIncludes() }),
            message: 'Employé créé avec succès'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getEmployees = async (req, res) => {
    try {
        const { status, search, role, companyId, agencyId, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (role) where.role = role;
        if (companyId) where.companyId = companyId;
        if (agencyId) where.agencyId = agencyId;
        if (search) {
            where[Op.or] = [
                { firstName: { [Op.like]: `%${search}%` } },
                { lastName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { counterId: { [Op.like]: `%${search}%` } }
            ];
        }

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.max(parseInt(limit, 10), 1);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await EmployeeModel.findAndCountAll({
            where,
            include: employeeIncludes(),
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset,
            distinct: true
        });

        return res.status(200).json({ employees: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getEmployee = async (req, res) => {
    try {
        const employee = await EmployeeModel.findByPk(req.params.id, { include: employeeIncludes() });
        if (!employee) return res.status(404).json({ message: 'Employé introuvable' });
        return res.status(200).json({ employee });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const updateEmployee = async (req, res) => {
    try {
        const employee = await EmployeeModel.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employé introuvable' });

        if (req.body.email) {
            const exist = await EmployeeModel.findOne({ where: { email: req.body.email, id: { [Op.ne]: employee.id } } });
            if (exist) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        if (req.body.userId) {
            const user = await UserModel.findByPk(req.body.userId);
            if (!user) return res.status(400).json({ message: 'Utilisateur introuvable' });

            const userExist = await EmployeeModel.findOne({ where: { userId: req.body.userId, id: { [Op.ne]: employee.id } } });
            if (userExist) return res.status(400).json({ message: 'Cet utilisateur est déjà lié à un employé' });
        }

        await employee.update(req.body);

        if (employee.userId) {
            const linkedUser = await UserModel.findByPk(employee.userId);
            if (linkedUser) {
                const userFields = {};
                if (req.body.lastName) userFields.lastname = req.body.lastName;
                if (req.body.firstName) userFields.firstname = req.body.firstName;
                if (req.body.phone != null) userFields.phone = req.body.phone || null;
                if (req.body.email && req.body.email !== linkedUser.email) {
                    const emailTaken = await UserModel.findOne({ where: { email: req.body.email, id: { [Op.ne]: linkedUser.id } } });
                    if (emailTaken) return res.status(400).json({ message: 'Cet email est déjà utilisé' });
                    userFields.email = req.body.email;
                }
                if (Object.keys(userFields).length > 0) await linkedUser.update(userFields);
            }
        }

        return res.status(200).json({
            employee: await EmployeeModel.findByPk(employee.id, { include: employeeIncludes() }),
            message: 'Employé mis à jour'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const uploadEmployeeAvatar = async (req, res) => {
    try {
        const employee = await EmployeeModel.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employé introuvable' });
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier reçu' });

        const avatar = `/uploads/avatars/${req.file.filename}`;
        await employee.update({ avatar });

        return res.status(200).json({
            success: true,
            avatar,
            employee: await EmployeeModel.findByPk(employee.id, { include: employeeIncludes() })
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const deleteEmployee = async (req, res) => {
    try {
        const employee = await EmployeeModel.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employé introuvable' });

        const [shipments, payments] = await Promise.all([
            ShipmentModel.count({ where: { agentId: employee.id } }),
            PaymentModel.count({ where: { agentId: employee.id } })
        ]);

        const total = shipments + payments;
        if (total > 0) {
            return res.status(400).json({
                message: `Impossible de supprimer : l'employé possède ${total} élément(s) lié(s) (expéditions, paiements).`
            });
        }

        await employee.destroy();

        return res.status(200).json({ message: 'Employé supprimé' });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
