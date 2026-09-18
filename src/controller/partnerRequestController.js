import {Op} from 'sequelize';
import PartnerRequestModel from '../model/PartnerRequestModel.js';
import CompanyModel from '../model/CompanyModel.js';
import UserModel from '../model/UserModel.js';
import EmployeeModel from '../model/EmployeeModel.js';
import SubscriptionModel from '../model/SubscriptionModel.js';
import {generatePartnerRequestReference} from '../helper/reference.js';
import sequelize from '../../config/sequelize_app.js';
import {partnerRequestQuerySchema} from '../schema/partnerRequestSchema.js';
import {ROLES} from '../../config/app.js';
import {sendTemplateEmail} from '../helper/sendMail.js';

const slugify = (str) =>
    String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 150);

export const createPartnerRequest = async (req, res) => {
    try {
        let reference;
        await sequelize.transaction(async (transaction) => {
            reference = await generatePartnerRequestReference(transaction);
            await PartnerRequestModel.create({ ...req.body, reference }, { transaction });
        });

        return res.status(201).json({
            reference,
            message: 'Demande de partenariat envoyée avec succès'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getPartnerRequests = async (req, res) => {
    try {
        const { value, error } = partnerRequestQuerySchema.validate(req.query, { abortEarly: false });
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { status, search, page = 1, limit = 20 } = value;

        const where = {};
        if (status) where.status = status;
        if (search) {
            where[Op.or] = [
                { companyName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { reference: { [Op.like]: `%${search}%` } },
                { managerFirstName: { [Op.like]: `%${search}%` } },
                { managerLastName: { [Op.like]: `%${search}%` } }
            ];
        }

        const pageNum = Math.max(parseInt(page, 10), 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10), 1), 200);
        const offset = (pageNum - 1) * limitNum;

        const { rows, count } = await PartnerRequestModel.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limitNum,
            offset
        });

        return res.status(200).json({ requests: rows, total: count, page: pageNum, limit: limitNum });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const getPartnerRequest = async (req, res) => {
    try {
        const request = await PartnerRequestModel.findByPk(req.params.id);
        if (!request) return res.status(404).json({ message: 'Demande introuvable' });
        return res.status(200).json({ request });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

export const reviewPartnerRequest = async (req, res) => {
    try {
        const request = await PartnerRequestModel.findByPk(req.params.id);
        if (!request) return res.status(404).json({ message: 'Demande introuvable' });

        const { status, reviewedBy, rejectionReason } = req.body;

        if (request.status === status) {
            return res.status(200).json({
                request: await PartnerRequestModel.findByPk(request.id),
                message: 'Demande déjà à ce statut'
            });
        }

        let createdCompany = null;
        let createdUser = null;
        let tempPassword = null;

        const t = await sequelize.transaction();

        try {
            await request.update({
                status,
                reviewedBy,
                rejectionReason: status === 'rejected' ? rejectionReason ?? null : null,
                reviewedAt: new Date()
            }, { transaction: t });

            if (status === 'approved') {
                const slug = slugify(request.companySigle || request.companyName);

                // 1. Compagnie
                let company = await CompanyModel.findOne({
                    where: { [Op.or]: [{ slug }, { email: request.email }] },
                    transaction: t
                });
                if (!company) {
                    company = await CompanyModel.create({
                        name: request.companyName,
                        slug,
                        city: request.city || null,
                        address: request.address || null,
                        phone: request.phone || request.managerPhone || null,
                        email: request.email,
                        taxId: request.contribuable || request.rccm || null,
                        status: 'active'
                    }, { transaction: t });
                }
                createdCompany = company;

                // 2. Admin User
                const adminEmail = request.managerEmail || request.email;
                tempPassword = `Admin@${Math.floor(100000 + Math.random() * 900000)}`;

                let user = await UserModel.findOne({ where: { email: adminEmail }, transaction: t });
                if (!user) {
                    user = await UserModel.create({
                        firstname: request.managerFirstName || 'Manager',
                        lastname: request.managerLastName || request.companyName,
                        email: adminEmail,
                        phone: request.managerPhone || request.phone || null,
                        password: tempPassword,
                        roles: ROLES.ADMIN,
                        status: true,
                        verified: true
                    }, { transaction: t });
                }
                createdUser = user;

                // 3. Employé Manager
                let employee = await EmployeeModel.findOne({ where: { userId: user.id }, transaction: t });
                if (!employee) {
                    await EmployeeModel.create({
                        userId: user.id,
                        companyId: company.id,
                        firstName: user.firstname,
                        lastName: user.lastname,
                        email: user.email,
                        phone: user.phone,
                        role: 'manager',
                        status: 'active'
                    }, { transaction: t });
                }

                // 4. Abonnement Initial
                let sub = await SubscriptionModel.findOne({ where: { companyId: company.id }, transaction: t });
                if (!sub) {
                    await SubscriptionModel.create({
                        companyId: company.id,
                        plan: request.plan || 'free',
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                        status: 'active',
                        autoRenew: true
                    }, { transaction: t });
                }
            }

            await t.commit();
        }
        catch (err) {
            await t.rollback();
            throw err;
        }

        // Email en arrière-plan si approuvé
        if (status === 'approved' && createdUser) {
            try {
                await sendTemplateEmail(
                    createdUser.email,
                    'Demande de partenariat approuvée — Vos accès LogisticPro',
                    'welcome',
                    {
                        username: `${createdUser.lastname} ${createdUser.firstname}`,
                        validatedCode: tempPassword,
                        countMinutes: 60
                    }
                );
            }
            catch (mailErr) {
                console.log('Erreur envoi email approbation:', mailErr.message);
            }
        }

        return res.status(200).json({
            request: await PartnerRequestModel.findByPk(request.id),
            createdCompany,
            tempAdminPassword: tempPassword,
            message: status === 'approved'
                ? 'Demande approuvée. L\'entreprise, le compte manager et l\'abonnement ont été créés avec succès.'
                : status === 'rejected'
                    ? 'Demande rejetée'
                    : 'Demande remise en attente'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};

