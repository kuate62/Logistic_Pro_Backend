import joi from 'joi';
import {SHIPMENT_STATUSES, PARCEL_STATUSES, PAYMENT_METHODS, PARCEL_CATEGORIES} from '../../config/app.js';

const senderSchema = joi.object({
    name: joi.string().max(150).allow('', null).optional(),
    phone: joi.string().max(20).allow('', null).optional(),
    company: joi.string().max(150).allow('', null).optional(),
    city: joi.string().max(100).allow('', null).optional(),
    address: joi.string().max(255).allow('', null).optional()
}).optional();

const recipientSchema = joi.object({
    name: joi.string().max(150).allow('', null).optional(),
    phone: joi.string().max(20).allow('', null).optional(),
    city: joi.string().max(100).allow('', null).optional(),
    address: joi.string().max(255).allow('', null).optional()
}).optional();

const dimensionsSchema = joi.object({
    length: joi.number().positive().optional(),
    width: joi.number().positive().optional(),
    height: joi.number().positive().optional()
}).optional();

export const parcelSchema = joi.object({
    weight: joi.number().min(0).required().messages({
        'number.base': 'Le poids du colis doit être un nombre',
        'number.min': 'Le poids du colis doit être positif'
    }),
    dimensions: dimensionsSchema,
    category: joi.string().valid(...PARCEL_CATEGORIES).default('standard').messages({
        'any.only': 'Catégorie de colis invalide'
    }),
    description: joi.string().max(255).allow('', null).optional(),
    declaredValue: joi.number().min(0).default(0)
});

export const createShipmentSchema = joi.object().keys({
    clientId: joi.number().integer().required().messages({
        'any.required': 'Le client est requis',
        'number.base': 'Le client est requis'
    }),
    companyId: joi.number().integer().required().messages({
        'any.required': 'La compagnie est requise',
        'number.base': 'La compagnie est requise'
    }),
    agencyId: joi.number().integer().required().messages({
        'any.required': "L'agence d'origine est requise",
        'number.base': "L'agence d'origine est requise"
    }),
    destinationAgencyId: joi.number().integer().optional(),
    routeId: joi.number().integer().allow(null).optional(),
    agentId: joi.number().integer().optional(),
    origin: joi.string().max(100).required().messages({
        'any.required': "La ville d'origine est requise",
        'string.empty': "La ville d'origine est requise"
    }),
    destination: joi.string().max(100).required().messages({
        'any.required': 'La ville de destination est requise',
        'string.empty': 'La ville de destination est requise'
    }),
    sender: senderSchema,
    recipient: recipientSchema,
    paymentMethod: joi.string().valid(...PAYMENT_METHODS).optional().messages({
        'any.only': 'Méthode de paiement invalide'
    }),
    totalAmount: joi.number().min(0).required().messages({
        'any.required': 'Le montant total est requis',
        'number.base': 'Le montant total doit être un nombre',
        'number.min': 'Le montant total doit être positif'
    }),
    paidAmount: joi.number().min(0).default(0),
    note: joi.string().allow('', null).optional(),
    estimatedDeliveryDate: joi.date().optional(),
    parcels: joi.array().items(parcelSchema).min(1).required().messages({
        'any.required': 'Au moins un colis est requis',
        'array.min': 'Au moins un colis est requis'
    })
}).options({ stripUnknown: true });

export const updateShipmentStatusSchema = joi.object().keys({
    status: joi.string().valid(...SHIPMENT_STATUSES).required().messages({
        'any.required': 'Le statut est requis',
        'any.only': 'Statut d\'expédition invalide'
    })
}).options({ stripUnknown: true });

export const updateShipmentSchema = joi.object().keys({
    destinationAgencyId: joi.number().integer().allow(null).optional(),
    routeId: joi.number().integer().allow(null).optional(),
    agentId: joi.number().integer().allow(null).optional(),
    origin: joi.string().max(100).allow('', null).optional(),
    destination: joi.string().max(100).allow('', null).optional(),
    sender: senderSchema,
    recipient: recipientSchema,
    paymentMethod: joi.string().valid(...PAYMENT_METHODS).allow(null).optional(),
    totalAmount: joi.number().min(0).optional(),
    paidAmount: joi.number().min(0).optional(),
    note: joi.string().allow('', null).optional(),
    estimatedDeliveryDate: joi.date().allow(null).optional()
}).options({ stripUnknown: true });

export const updateParcelStatusSchema = joi.object().keys({
    status: joi.string().valid(...PARCEL_STATUSES).required().messages({
        'any.required': 'Le statut est requis',
        'any.only': 'Statut de colis invalide'
    }),
    location: joi.string().max(255).allow('', null).optional(),
    description: joi.string().max(255).allow('', null).optional(),
    agentName: joi.string().max(150).allow('', null).optional()
}).options({ stripUnknown: true });

export const trackingQuerySchema = joi.object().keys({
    trackingNumber: joi.string().required().messages({
        'any.required': 'Le numéro de suivi est requis',
        'string.empty': 'Le numéro de suivi est requis'
    })
});
