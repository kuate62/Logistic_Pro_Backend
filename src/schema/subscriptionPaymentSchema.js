import joi from 'joi';
import {SUBSCRIPTION_PAYMENT_STATUSES} from '../model/SubscriptionPaymentModel.js';

export const createSubscriptionPaymentSchema = joi.object().keys({
    amount: joi.number().min(0).required().messages({
        'any.required': 'Le montant est requis'
    }),
    currency: joi.string().max(10).default('FCFA'),
    paymentMethod: joi.string().max(50).allow('', null).optional(),
    status: joi.string().valid(...SUBSCRIPTION_PAYMENT_STATUSES).default('paid'),
    periodStart: joi.date().optional(),
    periodEnd: joi.date().allow(null).optional()
}).options({ stripUnknown: true });

export const updateSubscriptionPaymentSchema = joi.object().keys({
    status: joi.string().valid(...SUBSCRIPTION_PAYMENT_STATUSES).required().messages({
        'any.required': 'Le statut est requis',
        'any.only': 'Statut de paiement invalide'
    })
}).options({ stripUnknown: true });

export const subscriptionPaymentQuerySchema = joi.object().keys({
    status: joi.string().valid(...SUBSCRIPTION_PAYMENT_STATUSES).optional(),
    page: joi.number().integer().min(1).optional(),
    limit: joi.number().integer().min(1).max(200).optional()
});

export const invoiceQuerySchema = joi.object().keys({
    status: joi.string().valid('pending', 'paid', 'cancelled').optional(),
    page: joi.number().integer().min(1).optional(),
    limit: joi.number().integer().min(1).max(200).optional()
});
