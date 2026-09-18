import joi from 'joi';

export const createCitySchema = joi.object().keys({
    name: joi.string().min(1).max(100).required().messages({
        'any.required': 'Le nom de la ville est requis',
        'string.empty': 'Le nom de la ville est requis'
    }),
    region: joi.string().max(100).allow('', null).optional(),
    country: joi.string().max(100).default('Cameroun'),
    status: joi.boolean().default(true)
}).options({ stripUnknown: true });

export const updateCitySchema = joi.object().keys({
    id: joi.number().integer().optional(),
    name: joi.string().min(1).max(100).optional(),
    region: joi.string().max(100).allow('', null).optional(),
    country: joi.string().max(100).optional(),
    status: joi.boolean().optional()
}).options({ stripUnknown: true });
