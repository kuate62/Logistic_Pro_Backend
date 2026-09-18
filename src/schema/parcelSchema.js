import joi from 'joi';
import {PARCEL_STATUSES, PARCEL_CATEGORIES} from '../../config/app.js';

export const parcelQuerySchema = joi.object().keys({
    companyId: joi.number().integer().optional(),
    clientId: joi.number().integer().optional(),
    agencyId: joi.number().integer().optional(),
    originAgencyId: joi.number().integer().optional(),
    destinationAgencyId: joi.number().integer().optional(),
    status: joi.string().valid(...PARCEL_STATUSES).optional(),
    category: joi.string().valid(...PARCEL_CATEGORIES).optional(),
    search: joi.string().allow('', null).optional(),
    dateFrom: joi.date().optional(),
    dateTo: joi.date().optional(),
    page: joi.number().integer().min(1).optional(),
    limit: joi.number().integer().min(1).optional()
}).options({ stripUnknown: true });
