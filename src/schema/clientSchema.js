import joi from 'joi';
import {CLIENT_STATUSES} from '../../config/app.js';

export const createClientSchema = joi.object().keys({
    userId: joi.number().integer().allow(null).optional(),
    companyId: joi.number().integer().optional(),
    firstName: joi.string().min(1).max(100).required().messages({
        'any.required': 'Le prénom est requis',
        'string.empty': 'Le prénom est requis'
    }),
    lastName: joi.string().max(100).allow('', null).optional(),
    email: joi.string().email().allow('', null).optional().messages({
        'string.email': 'Adresse email invalide'
    }),
    phone: joi.string().max(20).allow('', null).optional(),
    city: joi.string().max(100).allow('', null).optional(),
    address: joi.string().max(255).allow('', null).optional(),
    idType: joi.string().max(30).allow('', null).optional(),
    idNumber: joi.string().max(50).allow('', null).optional(),
    avatar: joi.string().max(255).allow('', null).optional(),
    preferredAgencyId: joi.number().integer().optional(),
    status: joi.string().valid(...CLIENT_STATUSES).default('active').messages({
        'any.only': 'Statut de client invalide'
    })
}).options({ stripUnknown: true });

export const updateClientSchema = joi.object().keys({
    id: joi.number().integer().optional(),
    userId: joi.number().integer().allow(null).optional(),
    companyId: joi.number().integer().optional(),
    firstName: joi.string().min(1).max(100).optional(),
    lastName: joi.string().min(1).max(100).optional(),
    email: joi.string().email().allow('', null).optional(),
    phone: joi.string().max(20).allow('', null).optional(),
    city: joi.string().max(100).allow('', null).optional(),
    address: joi.string().max(255).allow('', null).optional(),
    idType: joi.string().max(30).allow('', null).optional(),
    idNumber: joi.string().max(50).allow('', null).optional(),
    avatar: joi.string().max(255).allow('', null).optional(),
    preferredAgencyId: joi.number().integer().allow(null).optional(),
    status: joi.string().valid(...CLIENT_STATUSES).optional()
}).options({ stripUnknown: true });
