import joi from 'joi';

export const PRICE_STATUSES = ['active', 'inactive'];

export const createPriceSchema = joi.object().keys({
    companyId: joi.number().integer().required().messages({
        'any.required': 'La compagnie est requise',
        'number.base': 'La compagnie est requise'
    }),
    agencyId: joi.number().integer().allow(null).optional(),
    category: joi.string().max(30).default('standard').messages({
        'string.max': 'Catégorie trop longue'
    }),
    unit: joi.string().max(10).default('kg'),
    ratePerKg: joi.number().min(0).default(0).messages({
        'number.min': 'Le tarif par kg ne peut pas être négatif'
    }),
    minWeight: joi.number().min(0).default(0),
    maxWeight: joi.number().min(0).allow(null).optional(),
    fixedFee: joi.number().min(0).default(0),
    status: joi.string().valid(...PRICE_STATUSES).default('active').messages({
        'any.only': 'Statut de prix invalide'
    })
}).options({ stripUnknown: true });

export const updatePriceSchema = joi.object().keys({
    id: joi.number().integer().optional(),
    companyId: joi.number().integer().optional(),
    agencyId: joi.number().integer().allow(null).optional(),
    category: joi.string().max(30).optional(),
    unit: joi.string().max(10).optional(),
    ratePerKg: joi.number().min(0).optional(),
    minWeight: joi.number().min(0).optional(),
    maxWeight: joi.number().min(0).allow(null).optional(),
    fixedFee: joi.number().min(0).optional(),
    status: joi.string().valid(...PRICE_STATUSES).optional()
}).options({ stripUnknown: true });
