const Joi = require('joi');

/**
 * Middleware for validating request data against a Joi schema
 * @param {Joi.ObjectSchema} schema - The Joi schema to validate against
 * @param {string} source - The property of req to validate (body, query, params). Default is 'body'.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error } = schema.validate(req[source], {
    abortEarly: false, // Return all errors, not just the first one
    allowUnknown: true, // Allow fields not in the schema (optional, safer to set false for strict validation)
    stripUnknown: true // Remove unknown fields from the request object (sanitization)
  });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      error: errorMessage
    });
  }

  // If validation successful, replace req[source] with the validated (and sanitized) value
  // This ensures types are correct (e.g. number strings converted to numbers) if Joi handles it
  // But Joi.validate returns { value, error }, it does not mutate.
  // We should re-assign if we want the sanitized values.
  const { value } = schema.validate(req[source], {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
  });
  req[source] = value;

  next();
};

module.exports = validate;
