import joi from 'joi'
import Joi from "joi"
import {ROLES} from "../../config/app.js";
import {generateCodeRegex} from "../helper/helpers.js";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export const userDefaultSchema = joi.object().keys(
    {
        id: Joi.number().integer().optional(),
        firstname: Joi.string().min(3).when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required().messages({
                'string.empty': 'Firstname is required',
                'string.base': 'Firstname must be a string',
                'string.min': 'firstname must contain at least {#limit} characters'
            })
        }),
        lastname: Joi.string().min(3).when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required().messages({
                'string.empty': 'Last name is required',
                'string.base': 'Last name must be a string',
                'string.min': 'lastname must contain at least {#limit} characters'
            })
        }),
        email: Joi.string().email().when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required()
        }),
        gender: Joi.string().valid('M', 'F').optional(),
        profile: Joi.number().integer().optional(),
        password: Joi.string().regex(passwordRegex).when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required()
        }),
        confirmPassword: Joi.string().when('password', {
            is: Joi.exist(),
            then: Joi.valid(Joi.ref('password')).required().messages({
                'any.only': 'Password and confirmation must match',
                'string.base': 'Confirmation must be a string'
            }),
            otherwise: Joi.optional()
        })
    }
).options({ stripUnknown: true })

export const forgotPasswordSchema = joi.object().keys(
    {
        email: Joi.string().email().required()
    }).options({ stripUnknown: true })

export const verifyResetCodeSchema = joi.object().keys(
    {
        email: Joi.string().email().required(),
        code: Joi.string().regex(generateCodeRegex(6)).required().messages({
            'string.pattern.base': 'Le code doit contenir 6 chiffres'
        })
    }).options({ stripUnknown: true })

export const registerSchema = joi.object().keys(
    {
        lastname: Joi.string().min(1).max(50).required().messages({
            'string.empty': 'Le nom est requis',
            'string.min': 'Le nom doit contenir au moins {#limit} caractères'
        }),
        firstname: Joi.string().min(1).max(50).required().messages({
            'string.empty': 'Le prénom est requis',
            'string.min': 'Le prénom doit contenir au moins {#limit} caractères'
        }),
        email: Joi.string().email().required().messages({
            'string.empty': 'L\'email est requis',
            'string.email': 'Adresse email invalide'
        }),
        gender: Joi.string().valid('M', 'F').optional(),
        phone: Joi.string().max(20).allow('', null).optional().messages({
            'string.max': 'Le numéro de téléphone ne peut dépasser {#limit} caractères'
        }),
        password: Joi.string().pattern(passwordRegex).required().messages({
            'string.empty': 'Le mot de passe est requis',
            'string.pattern.base': 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)'
        }),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Les mots de passe ne correspondent pas',
            'string.empty': 'Confirmez votre mot de passe'
        }),
        roles: Joi.array().items(Joi.string().valid(...Object.values(ROLES))).optional()
    }).options({ stripUnknown: true })

export const resetPasswordSchema = (length = 6) => {
    return joi.object().keys(
        {
            email: joi.string().email().required(),
            code: Joi.string().regex(generateCodeRegex(length)).required(),
            password: joi.string().pattern(passwordRegex).required(),
            confirmPassword: joi.any().equal(joi.ref("password")).required().messages({
                "any.only": "Les mots de passe doivent être identiques !"
            })
        }).options({ stripUnknown: true })
}

export const createUserSchema = joi.object().keys(
    {
        firstname: Joi.string().min(3).required(),
        lastname: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).when('id', {
            is: Joi.exist(),
            then: Joi.optional(),
            otherwise: Joi.required()
        }),
        roles: Joi.array().items(Joi.string().valid(...Object.values(ROLES))).min(1).required().messages({
            'array.base': 'Roles must be an array',
            'array.includesSingle': 'Roles must contain only valid role names',
            'array.includesUnknown': 'Roles must contain only valid role names',
            'array.min': 'Roles must contain at least {#limit} role names',
            'string.empty': 'Role names cannot be empty',
            'string.base': 'Role names must be strings',
            'any.only': 'Roles must contain only valid role names'
        })
    }).options({ stripUnknown: true })

export const loginSchema = joi.object().keys(
    {
        email: Joi.string().email().required().messages({
            'string.empty': 'Email is required',
            'string.email': 'Email must be a valid email address',
            'string.base': 'Email must be a string'
        }),
        password: Joi.string().regex(passwordRegex).required().messages({
            'string.empty': 'Password is required',
            'string.base': 'Password must be a string',
            'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and be at least 8 characters long',
        })
    }).options({ stripUnknown: true })

export const adminCreateUserSchema = joi.object().keys(
    {
        firstname: Joi.string().min(1).max(50).required().messages({
            'string.empty': 'Le prénom est requis'
        }),
        lastname: Joi.string().min(1).max(50).required().messages({
            'string.empty': 'Le nom est requis'
        }),
        email: Joi.string().email().required().messages({
            'string.empty': 'L\'email est requis',
            'string.email': 'Adresse email invalide'
        }),
        gender: Joi.string().valid('M', 'F').optional(),
        phone: Joi.string().max(20).allow('', null).optional(),
        password: Joi.string().pattern(passwordRegex).required().messages({
            'string.empty': 'Le mot de passe est requis',
            'string.pattern.base': 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)'
        }),
        roles: Joi.string().valid(...Object.values(ROLES)).default(ROLES.USER).messages({
            'any.only': 'Rôle invalide'
        }),
        status: Joi.boolean().default(true),
        verified: Joi.boolean().default(true)
    }).options({ stripUnknown: true })

export const adminUpdateUserSchema = joi.object().keys(
    {
        firstname: Joi.string().min(1).max(50).optional(),
        lastname: Joi.string().min(1).max(50).optional(),
        email: Joi.string().email().optional(),
        gender: Joi.string().valid('M', 'F').optional(),
        phone: Joi.string().max(20).allow('', null).optional(),
        password: Joi.string().pattern(passwordRegex).optional(),
        roles: Joi.string().valid(...Object.values(ROLES)).optional(),
        status: Joi.boolean().optional(),
        verified: Joi.boolean().optional()
    }).options({ stripUnknown: true })

export const changePasswordSchema = joi.object().keys(
    {
        currentPassword: Joi.string().required().messages({
            'string.empty': 'Le mot de passe actuel est requis',
            'string.base': 'Le mot de passe actuel est requis'
        }),
        newPassword: Joi.string().pattern(passwordRegex).required().messages({
            'string.empty': 'Le nouveau mot de passe est requis',
            'string.pattern.base': 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)'
        }),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
            'any.only': 'Les mots de passe ne correspondent pas',
            'string.empty': 'Confirmez le nouveau mot de passe'
        })
    }).options({ stripUnknown: true })

export const validatedCodeSchema = (length = 6) => {
    return joi.object().keys(
        {
            code: joi.string().regex(generateCodeRegex(length)).required()
        }
    )
}
