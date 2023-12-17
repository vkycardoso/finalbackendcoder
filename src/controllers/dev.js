import logger from '../utils/logger.js';

class DevController {
  static async testLogger(req, res) {
    logger.http('This is an http message');
    logger.info('This is an info message');
    logger.warn('This is a warning message');
    logger.error('This is an error message');
    logger.fatal('This is a fatal message');

    res.status(200).json({ status:'success', message: 'Check the logs' });
  }
}

export default DevController;