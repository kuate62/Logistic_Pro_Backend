import joi from 'joi';
import {PLAN_STATUSES} from '../model/PlanModel.js';

export const createPlanSchema = joi.object().keys({
    code: joi.string().max(30).optional(),
    name: joi.string().max(100).required().messages({
        'any.required': 'Le nom du plan est requis'
    }),
    description: joi.string().allow('', null).optional(),
    price: joi.number().min(0).required().messages({
        'any.required': 'Le prix est requis',
        'number.min': 'Le prix doit être positif'
    }),
    currency: joi.string().max(10).default('FCFA'),
    billingCycle: joi.string().max(20).default('monthly'),
    maxAgencies: joi.number().integer().allow(-1).default(-1),
    maxUsers: joi.number().integer().allow(-1).default(-1),
    maxStorage: joi.number().min(0).default(0),
    maxShipments: joi.number().integer().allow(-1).default(-1),
    features: joi.array().items(joi.string()).default([]),
    status: joi.string().valid(...PLAN_STATUSES).default('active')
}).options({ stripUnknown: true });

export const updatePlanSchema = joi.object().keys({
    id: joi.alternatives().try(joi.number().integer(), joi.string().max(30)).optional(),
    code: joi.string().max(30).optional(),
    name: joi.string().max(100).optional(),
    description: joi.string().allow('', null).optional(),
    price: joi.number().min(0).optional(),
    currency: joi.string().max(10).optional(),
    billingCycle: joi.string().max(20).optional(),
    maxAgencies: joi.number().integer().allow(-1).optional(),
    maxUsers: joi.number().integer().allow(-1).optional(),
    maxStorage: joi.number().min(0).optional(),
    maxShipments: joi.number().integer().allow(-1).optional(),
    features: joi.array().items(joi.string()).optional(),
    status: joi.string().valid(...PLAN_STATUSES).optional()
}).options({ stripUnknown: true });

export const planQuerySchema = joi.object().keys({
    status: joi.string().valid(...PLAN_STATUSES).optional(),
    search: joi.string().allow('').optional(),
    page: joi.number().integer().min(1).optional(),
    limit: joi.number().integer().min(1).max(200).optional()
});
