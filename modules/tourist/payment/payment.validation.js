const Joi = require("joi");

const createOrderValidation = (data) => {
  const schema = Joi.object({
    amount: Joi.number().required().min(1)
  });

  return schema.validate(data);
};

module.exports = {
  createOrderValidation
};