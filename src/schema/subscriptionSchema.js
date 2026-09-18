import joi from 'joi';

export const SUBSCRIPTION_STATUSES = ['active', 'expired', 'cancelled'];

export const createSubscriptionSchema = joi.object().keys({
    companyId: joi.number().integer().required().messages({
        'any.required': 'La compagnie est requise',
        'number.base': 'La compagnie est requise'
    }),
    plan: joi.string().max(30).default('free').messages({
        'string.max': 'Plan d\'abonnement invalide'
    }),
    startDate: joi.date().optional(),
    endDate: joi.date().allow(null).optional(),
    autoRenew: joi.boolean().optional(),
    status: joi.string().valid(...SUBSCRIPTION_STATUSES).default('active').messages({
        'any.only': 'Statut d\'abonnement invalide'
    })
}).options({ stripUnknown: true });

export const updateSubscriptionSchema = joi.object().keys({
    id: joi.number().integer().optional(),
    companyId: joi.number().integer().optional(),
    plan: joi.string().max(30).optional(),
    startDate: joi.date().optional(),
    endDate: joi.date().allow(null).optional(),
    autoRenew: joi.boolean().optional(),
    status: joi.string().valid(...SUBSCRIPTION_STATUSES).optional()
}).options({ stripUnknown: true });
