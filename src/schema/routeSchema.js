import joi from 'joi';
import {ROUTE_STATUSES} from '../../config/app.js';

export const createRouteSchema = joi.object().keys({
    companyId: joi.number().integer().required().messages({
        'any.required': 'La compagnie est requise',
        'number.base': 'La compagnie est requise'
    }),
    originAgencyId: joi.number().integer().required().messages({
        'any.required': "L'agence de départ est requise",
        'number.base': "L'agence de départ est requise"
    }),
    destinationAgencyId: joi.number().integer().required().messages({
        'any.required': "L'agence de destination est requise",
        'number.base': "L'agence de destination est requise"
    }),
    status: joi.string().valid(...ROUTE_STATUSES).default('planned').messages({
        'any.only': 'Statut de route invalide'
    }),
    departureDate: joi.date().allow(null).optional(),
    arrivalDate: joi.date().allow(null).optional(),
    vehicle: joi.string().max(100).allow('', null).optional(),
    driver: joi.string().max(150).allow('', null).optional(),
    note: joi.string().allow('', null).optional()
}).options({ stripUnknown: true });

export const updateRouteSchema = joi.object().keys({
    id: joi.number().integer().optional(),
    companyId: joi.number().integer().optional(),
    originAgencyId: joi.number().integer().optional(),
    destinationAgencyId: joi.number().integer().optional(),
    status: joi.string().valid(...ROUTE_STATUSES).optional(),
    departureDate: joi.date().allow(null).optional(),
    arrivalDate: joi.date().allow(null).optional(),
    vehicle: joi.string().max(100).allow('', null).optional(),
    driver: joi.string().max(150).allow('', null).optional(),
    note: joi.string().allow('', null).optional()
}).options({ stripUnknown: true });
