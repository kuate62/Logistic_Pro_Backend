import joi from 'joi';
import {EMPLOYEE_STATUSES, EMPLOYEE_ROLES} from '../../config/app.js';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const createEmployeeSchema = joi.object().keys({
    userId: joi.number().integer().optional(),
    companyId: joi.number().integer().required().messages({
        'any.required': 'La compagnie est requise',
        'number.base': 'La compagnie est requise'
    }),
    agencyId: joi.number().integer().optional(),
    firstName: joi.string().min(1).max(100).required().messages({
        'any.required': 'Le prénom est requis',
        'string.empty': 'Le prénom est requis'
    }),
    lastName: joi.string().min(1).max(100).required().messages({
        'any.required': 'Le nom est requis',
        'string.empty': 'Le nom est requis'
    }),
    email: joi.string().email().allow('', null).optional().messages({
        'string.email': 'Adresse email invalide'
    }),
    phone: joi.string().max(20).allow('', null).optional(),
    role: joi.string().valid(...EMPLOYEE_ROLES).default('depot_agent').messages({
        'any.only': 'Rôle d\'employé invalide'
    }),
    counterId: joi.string().max(30).allow('', null).optional(),
    permissions: joi.object().optional(),
    avatar: joi.string().max(255).allow('', null).optional(),
    status: joi.string().valid(...EMPLOYEE_STATUSES).default('active').messages({
        'any.only': 'Statut d\'employé invalide'
    }),
    createUser: joi.boolean().default(false).optional(),
    password: joi.string().pattern(passwordRegex).when('createUser', {
        is: true,
        then: joi.required().messages({
            'any.required': 'Le mot de passe est requis pour créer le compte',
            'string.pattern.base': 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)'
        }),
        otherwise: joi.optional()
    })
}).options({ stripUnknown: true });

export const updateEmployeeSchema = joi.object().keys({
    id: joi.number().integer().optional(),
    userId: joi.number().integer().allow(null).optional(),
    companyId: joi.number().integer().optional(),
    agencyId: joi.number().integer().allow(null).optional(),
    firstName: joi.string().min(1).max(100).optional(),
    lastName: joi.string().min(1).max(100).optional(),
    email: joi.string().email().allow('', null).optional(),
    phone: joi.string().max(20).allow('', null).optional(),
    role: joi.string().valid(...EMPLOYEE_ROLES).optional(),
    counterId: joi.string().max(30).allow('', null).optional(),
    permissions: joi.object().optional(),
    avatar: joi.string().max(255).allow('', null).optional(),
    status: joi.string().valid(...EMPLOYEE_STATUSES).optional()
}).options({ stripUnknown: true });
