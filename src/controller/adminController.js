import { Op, Sequelize } from 'sequelize';
import CompanyModel from '../model/CompanyModel.js';
import SubscriptionModel from '../model/SubscriptionModel.js';
import UserModel from '../model/UserModel.js';
import PartnerRequestModel from '../model/PartnerRequestModel.js';
import SubscriptionPaymentModel from '../model/SubscriptionPaymentModel.js';
import { ROLES } from '../../config/app.js';

export const getAdminStats = async (req, res) => {
    try {
        const [
            totalEnterprises,
            activeEnterprises,
            suspendedEnterprises,
            archivedEnterprises,
            totalPlatformUsers,
            totalManagers,
            pendingRequests,
            subsByStatusRows,
            subsByPlanRows,
            totalRevenueResult
        ] = await Promise.all([
            CompanyModel.count(),
            CompanyModel.count({ where: { status: 'active' } }),
            CompanyModel.count({ where: { status: 'suspended' } }),
            CompanyModel.count({ where: { status: 'inactive' } }),
            UserModel.count(),
            UserModel.count({ where: { roles: { [Op.like]: `%${ROLES.ADMIN}%` } } }),
            PartnerRequestModel.count({ where: { status: 'pending' } }),
            SubscriptionModel.findAll({
                attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
                group: ['status'],
                raw: true
            }),
            SubscriptionModel.findAll({
                attributes: ['plan', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
                group: ['plan'],
                raw: true
            }),
            SubscriptionPaymentModel.sum('amount', { where: { status: 'paid' } })
        ]);

        const totalRevenue = totalRevenueResult || 0;

        // Tendance revenus sur les 7 derniers mois
        const revenueChart = [];
        const monthNames = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

            const sum = await SubscriptionPaymentModel.sum('amount', {
                where: {
                    status: 'paid',
                    paidAt: { [Op.between]: [monthStart, monthEnd] }
                }
            }) || 0;

            revenueChart.push({
                month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
                revenue: sum
            });
        }

        const subscriptionsByStatus = [
            { status: 'active', count: Number(subsByStatusRows.find(r => r.status === 'active')?.count || 0) },
            { status: 'suspended', count: Number(subsByStatusRows.find(r => r.status === 'cancelled' || r.status === 'suspended')?.count || 0) },
            { status: 'expired', count: Number(subsByStatusRows.find(r => r.status === 'expired')?.count || 0) }
        ];

        const enterprisesByPlan = subsByPlanRows.map(r => ({
            plan: r.plan,
            count: Number(r.count || 0)
        }));

        return res.status(200).json({
            stats: {
                totalEnterprises,
                activeEnterprises,
                suspendedEnterprises,
                archivedEnterprises,
                totalPlatformUsers,
                totalManagers,
                pendingRequests,
                totalRevenue
            },
            revenueChart,
            subscriptionsByStatus,
            enterprisesByPlan
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message ?? 'An error occurred' });
    }
};
