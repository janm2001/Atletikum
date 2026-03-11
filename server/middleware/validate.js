const validate = (validator) => {
  return (request, response, next) => {
    validator(request);
    next();
  };
};

module.exports = validate;
