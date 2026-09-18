import joi from 'joi';
import {PARTNER_REQUEST_STATUSES} from '../model/PartnerRequestModel.js';

const STR = joi.string().trim();
const OPTIONAL_STR = joi.string().trim().allow('', null);

export const createPartnerRequestSchema = joi.object().keys({
    companyName: STR.max(150).required().messages({
        'any.required': 'Le nom de la société est requis',
        'string.empty': 'Le nom de la société est requis'
    }),
    companySigle: OPTIONAL_STR.max(50),
    rccm: OPTIONAL_STR.max(50),
    contribuable: OPTIONAL_STR.max(50),
    phone: OPTIONAL_STR.max(20),
    email: joi.string().trim().email().max(150).required().messages({
        'any.required': 'L\'email est requis',
        'string.email': 'L\'email est invalide'
    }),
    website: OPTIONAL_STR.max(255),
    address: OPTIONAL_STR.max(255),
    city: OPTIONAL_STR.max(100),
    region: OPTIONAL_STR.max(100),
    country: OPTIONAL_STR.max(100),
    managerFirstName: OPTIONAL_STR.max(100),
    managerLastName: OPTIONAL_STR.max(100),
    managerPhone: OPTIONAL_STR.max(20),
    managerEmail: OPTIONAL_STR.max(150),
    managerRole: OPTIONAL_STR.max(100),
    agencyCount: OPTIONAL_STR.max(30),
    employeeCount: OPTIONAL_STR.max(30),
    source: OPTIONAL_STR.max(150),
    description: joi.string().trim().allow('', null).max(5000),
    plan: STR.max(50).default('free')
}).options({ stripUnknown: true });

export const reviewPartnerRequestSchema = joi.object().keys({
    id: joi.number().integer().optional(),
    status: joi.string().valid(...PARTNER_REQUEST_STATUSES).required().messages({
        'any.required': 'Le statut est requis',
        'any.only': 'Statut de demande invalide'
    }),
    reviewedBy: OPTIONAL_STR.max(150),
    rejectionReason: OPTIONAL_STR.max(500)
}).options({ stripUnknown: true });

export const partnerRequestQuerySchema = joi.object().keys({
    status: joi.string().valid(...PARTNER_REQUEST_STATUSES).optional(),
    search: OPTIONAL_STR.max(150),
    page: joi.number().integer().min(1).optional(),
    limit: joi.number().integer().min(1).max(200).optional()
}).options({ stripUnknown: true });
