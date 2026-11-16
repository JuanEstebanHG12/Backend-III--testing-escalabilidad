import { swaggerSchemas, swaggerErrorResponses } from './schemas.docs.js';
import { usersPaths } from './users.docs.js';
import { ordersPaths } from './orders.docs.js';
import { deliveriesPaths } from './deliveries.docs.js';
import { mocksPaths } from './mocks.docs.js';
import { loggerPaths } from './logger.docs.js';
import { productsPaths } from './products.docs.js';

export const swaggerPaths = {
  ...usersPaths,
  ...ordersPaths,
  ...deliveriesPaths,
  ...mocksPaths,
  ...loggerPaths,
  ...productsPaths,
};

export { swaggerSchemas, swaggerErrorResponses };
