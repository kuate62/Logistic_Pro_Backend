import joi from 'joi';
import {PAYMENT_STATUSES, PAYMENT_METHODS} from '../../config/app.js';

export const createPaymentSchema = joi.object().keys({
    shipmentId: joi.number().integer().required().messages({
        'any.required': "L'expédition est requise",
        'number.base': "L'expédition est requise"
    }),
    amount: joi.number().positive().required().messages({
        'any.required': 'Le montant est requis',
        'number.base': 'Le montant doit être un nombre',
        'number.positive': 'Le montant doit être supérieur à 0'
    }),
    method: joi.string().valid(...PAYMENT_METHODS).default('cash').messages({
        'any.only': 'Mode de paiement invalide'
    }),
    status: joi.string().valid(...PAYMENT_STATUSES).default('pending').messages({
        'any.only': 'Statut de paiement invalide'
    }),
    transactionId: joi.string().max(100).allow('', null).optional(),
    comment: joi.string().max(255).allow('', null).optional()
}).options({ stripUnknown: true });

export const updatePaymentStatusSchema = joi.object().keys({
    status: joi.string().valid(...PAYMENT_STATUSES).required().messages({
        'any.required': 'Le statut est requis',
        'any.only': 'Statut de paiement invalide'
    })
}).options({ stripUnknown: true });

export const paymentQuerySchema = joi.object().keys({
    clientId: joi.number().integer().optional(),
    shipmentId: joi.number().integer().optional(),
    agencyId: joi.number().integer().optional(),
    companyId: joi.number().integer().optional(),
    status: joi.string().valid(...PAYMENT_STATUSES).optional(),
    method: joi.string().valid(...PAYMENT_METHODS).optional(),
    dateFrom: joi.date().optional(),
    dateTo: joi.date().optional(),
    page: joi.number().integer().min(1).optional(),
    limit: joi.number().integer().min(1).max(100).optional()
});
