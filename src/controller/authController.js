import UserModel from "../model/UserModel.js";
import EmployeeModel from "../model/EmployeeModel.js";
import ClientModel from "../model/ClientModel.js";
import { generateVerificationCode } from "../helper/helpers.js";
import { verifyPassword } from "../helper/password.js";
import { generateToken } from "../helper/jwt.js";
import { sendTemplateEmail } from "../helper/sendMail.js";

export const register = async (req, res) => {
    try {
        const countMinutes = 5
        const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60)

        const body = { ...req.body, code, expiredAt };

        const existEmail = await UserModel.findOne({ where: { email: body.email } })
        if (existEmail) return res.status(400).json({ message: 'Cet email est déjà utilisé' })

        const user = await UserModel.create(body);

        if (!user.roles || user.roles === 'user' || user.roles === 'ROLE_USER') {
            try {
                const existingClient = await ClientModel.findOne({ where: { email: user.email } });
                if (existingClient) {
                    if (!existingClient.userId) {
                        await existingClient.update({ userId: user.id });
                    }
                } else {
                    const lastClient = await ClientModel.findOne({ order: [['id', 'DESC']] });
                    const nextNum = (lastClient?.id || 0) + 1;
                    const clientCode = `CL-${String(nextNum).padStart(4, '0')}`;

                    await ClientModel.create({
                        userId: user.id,
                        clientCode,
                        firstName: user.firstname || user.firstName || '',
                        lastName: user.lastname || user.lastName || '',
                        email: user.email,
                        phone: user.phone || '',
                        city: user.city || '',
                        address: user.address || '',
                        status: 'active'
                    });
                }
            } catch (err) {
                console.log('Client profile auto-creation/linking warning:', err.message);
            }
        }

        const token = generateToken({ id: user.id, email: user.email, phone: user.phone, roles: user.roles });

        try {
            await sendTemplateEmail(
                user.email,
                'Vérification de votre compte',
                'welcome',
                {
                    username: `${user.lastname} ${user.firstname}`,
                    validatedCode: code,
                    countMinutes
                }
            )
        }
        catch (e) {
            console.log(e.message)
        }

        return res.status(201).json({
            user,
            token,
            message: 'Inscription réussie, un code de vérification a été envoyé à votre adresse email'
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await UserModel.scope('withPassword').findOne({ where: { email } })

        if (!user) return res.status(400).json({ message: 'Identifiants incorrect' })

        const status = await verifyPassword(password, user.password)

        if (!status) return res.status(400).json({ message: 'Identifiants incorrect' })

        const token = generateToken({ id: user.id, email, phone: user.phone, roles: user.roles })

        return res.status(200).json({ token })
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const logout = async (req, res) => {
    return res.status(200).json({ status: true, message: 'Déconnexion réussie' })
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        const user = await UserModel.scope('withCode').findOne({ where: { email } })

        if (!user) return res.status(404).json({ message: 'Aucun compte trouvé avec cet email' })

        const countMinutes = 5

        const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60)

        await user.set({ code, expiredAt })

        await user.save()

        try {
            await sendTemplateEmail(
                user.email,
                'Réinitialisation de votre mot de passe',
                'resetPassword',
                {
                    resetCode: code,
                    countMinutes
                }
            )
        }
        catch (e) {
            console.log(e.message)
        }

        return res.status(200).json({ status: true, message: 'Un code de réinitialisation a été envoyé à votre adresse email' })
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body

        const user = await UserModel.scope('withCode').findOne({ where: { email } })

        if (!user) return res.status(404).json({ message: 'Aucun compte trouvé avec cet email' })

        if (!user.code || user.code !== code) return res.status(400).json({ message: 'Code invalide' })

        if (user.expiredAt < (new Date())) return res.status(400).json({ message: 'Code expiré, demandez un nouveau code' })

        return res.status(200).json({ status: true, message: 'Code vérifié' })
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body

        const user = await UserModel.scope(['withPassword', 'withCode']).findOne({ where: { email } })

        if (!user || !user.code || user.code !== code) return res.status(400).json({ message: 'Code invalide' })

        if (user.expiredAt < (new Date())) return res.status(400).json({ message: 'Code expiré, demandez un nouveau code' })

        await user.set({ code: null, expiredAt: null, password })

        await user.save()

        try {
            await sendTemplateEmail(
                email,
                'Reset password confirm',
                'resetPasswordSuccess'
            )
        }
        catch (e) {
            console.log(e.message)
        }

        return res.status(200).json({ status: true, message: 'Votre mot de passe a été réinitialisé avec succès' })
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const verifyEmail = async (req, res) => {
    try {
        const { code } = req.body

        const user = await UserModel.scope('withCode').findByPk(req.user.id)

        if (!user) return res.status(404).json({ message: 'User not found' })

        if (code !== user.code) return res.status(400).json({ message: 'Invalid code' })

        if (user.expiredAt < (new Date())) return res.status(400).json({ message: 'Expired code' })

        await user.set({ code: null, expiredAt: null, verified: true, status: true })

        await user.save()

        return res.status(200).json({ status: true })
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const regenerateCode = async (req, res) => {
    try {
        const user = await UserModel.scope('withCode').findByPk(req.user.id)

        if (!user) return res.status(404).json({ message: 'User not found' })

        const countMinutes = 5

        const { code, expiredAt } = await generateVerificationCode(6, 1000 * countMinutes * 60)

        await user.set({ code, expiredAt })

        await user.save()

        try {
            await sendTemplateEmail(
                user.email,
                'Inscription réussie',
                'welcome',
                {
                    username: `${user.lastname} ${user.firstname}`,
                    validatedCode: code,
                    countMinutes
                }
            )
        }
        catch (e) {
            console.log(e.message)
        }

        return res.status(200).json({ status: true, message: 'Votre code a été regénéré !!!' })

    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const changePassword = async (req, res) => {
    try {
        const user = await UserModel.scope('withPassword').findByPk(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        const match = await verifyPassword(req.body.currentPassword, user.password)
        if (!match) return res.status(400).json({ message: 'Le mot de passe actuel est incorrect' })

        await user.set({ password: req.body.newPassword })
        await user.save()

        return res.status(200).json({ status: true, message: 'Votre mot de passe a été modifié avec succès' })
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}

export const getCurrentUser = async (req, res) => {
    try {
        const user = await UserModel.findByPk(req.user.id)
        if (!user) return res.status(404).json({ message: 'User not found' })

        const [employee, client] = await Promise.all([
            EmployeeModel.findOne({ where: { userId: user.id } }),
            ClientModel.findOne({ where: { userId: user.id } })
        ])

        const plainUser = user.toJSON();
        plainUser.companyId = employee?.companyId ?? client?.companyId ?? null;
        plainUser.agencyId = employee?.agencyId ?? null;
        plainUser.profile = employee ? 'employee' : client ? 'client' : null;
        plainUser.employeeId = employee?.id ?? null;
        plainUser.employeeRole = employee?.role ?? null;

        return res.status(200).json(plainUser)
    }
    catch (e) {
        return res.status(500).json({ message: e.message ?? 'An error occurred' })
    }
}
