const validate = (validator) => {
  return (request, response, next) => {
    try {
      validator(request);
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validate;
