const Joi = require('joi');

const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().allow('', null).optional(),
    phone: Joi.string()
        .pattern(/^(\+7|8)\d{10}$/)
        .message('Неверный формат номера телефона (Россия)')
        .allow('', null)
        .optional(),
    address: Joi.object({
        city: Joi.string().allow('', null).optional(),
        street: Joi.string().allow('', null).optional(),
        house: Joi.string().allow('', null).optional(),
        building: Joi.string().allow('', null).optional(),
        apartment: Joi.string().allow('', null).optional()
    }).optional()
});

module.exports = {
    updateProfileSchema
};
