import enumError from '../enum/enumError.js';

class CustomError extends Error {
  constructor(message, errorType) {
    super(message);
    this.name = 'CustomError';
    this.code = enumError[errorType] || 9;
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

export default CustomError;
