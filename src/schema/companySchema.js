import joi from 'joi';
import {COMPANY_STATUSES} from '../../config/app.js';

export const createCompanySchema = joi.object().keys({
    name: joi.string().min(2).max(150).required().messages({
        'any.required': 'Le nom de la compagnie est requis',
        'string.empty': 'Le nom de la compagnie est requis',
        'string.min': 'Le nom doit contenir au moins {#limit} caractères'
    }),
    slug: joi.string().max(150).optional().messages({
        'string.max': 'Le slug ne peut dépasser {#limit} caractères'
    }),
    city: joi.string().max(100).allow('', null).optional(),
    address: joi.string().max(255).allow('', null).optional(),
    phone: joi.string().max(20).allow('', null).optional().messages({
        'string.max': 'Le téléphone ne peut dépasser {#limit} caractères'
    }),
    email: joi.string().email().allow('', null).optional().messages({
        'string.email': 'Adresse email invalide'
    }),
    logo: joi.string().max(255).allow('', null).optional(),
    taxId: joi.string().max(50).allow('', null).optional(),
    status: joi.string().valid(...COMPANY_STATUSES).default('active').messages({
        'any.only': 'Statut de compagnie invalide'
    })
}).options({ stripUnknown: true });

export const updateCompanySchema = joi.object().keys({
    id: joi.number().integer().optional(),
    name: joi.string().min(2).max(150).optional().messages({
        'string.min': 'Le nom doit contenir au moins {#limit} caractères'
    }),
    slug: joi.string().max(150).allow('', null).optional(),
    city: joi.string().max(100).allow('', null).optional(),
    address: joi.string().max(255).allow('', null).optional(),
    phone: joi.string().max(20).allow('', null).optional(),
    email: joi.string().email().allow('', null).optional(),
    logo: joi.string().max(255).allow('', null).optional(),
    taxId: joi.string().max(50).allow('', null).optional(),
    status: joi.string().valid(...COMPANY_STATUSES).optional()
}).options({ stripUnknown: true });
