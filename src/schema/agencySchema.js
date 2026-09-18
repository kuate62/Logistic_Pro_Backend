import joi from 'joi';
import {AGENCY_STATUSES} from '../../config/app.js';

const hoursSchema = joi.alternatives().try(
    joi.array().items(joi.string().max(10)).length(2),
    joi.object({
        open: joi.string().max(10).optional(),
        close: joi.string().max(10).optional()
    }).optional(),
    joi.allow(null)
).optional();

export const createAgencySchema = joi.object().keys({
    companyId: joi.number().integer().required().messages({
        'any.required': 'La compagnie est requise',
        'number.base': 'La compagnie est requise'
    }),
    name: joi.string().min(2).max(150).required().messages({
        'any.required': "Le nom de l'agence est requis",
        'string.empty': "Le nom de l'agence est requis"
    }),
    city: joi.string().max(100).required().messages({
        'any.required': 'La ville est requise',
        'string.empty': 'La ville est requise'
    }),
    address: joi.string().max(255).allow('', null).optional(),
    phone: joi.string().max(20).allow('', null).optional(),
    email: joi.string().email().allow('', null).optional(),
    manager: joi.string().max(150).allow('', null).optional(),
    region: joi.string().max(100).allow('', null).optional(),
    hours: hoursSchema,
    isPrimary: joi.boolean().default(false),
    status: joi.string().valid(...AGENCY_STATUSES).default('active').messages({
        'any.only': "Statut d'agence invalide"
    })
}).options({ stripUnknown: true });

export const updateAgencySchema = joi.object().keys({
    id: joi.number().integer().optional(),
    companyId: joi.number().integer().optional(),
    name: joi.string().min(2).max(150).optional(),
    city: joi.string().max(100).optional(),
    address: joi.string().max(255).allow('', null).optional(),
    phone: joi.string().max(20).allow('', null).optional(),
    email: joi.string().email().allow('', null).optional(),
    manager: joi.string().max(150).allow('', null).optional(),
    region: joi.string().max(100).allow('', null).optional(),
    hours: hoursSchema,
    isPrimary: joi.boolean().optional(),
    status: joi.string().valid(...AGENCY_STATUSES).optional()
}).options({ stripUnknown: true });
