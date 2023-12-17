// swaggerConfig.js
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const configureSwagger = () => {
    const __dirname = path.resolve();

    const swaggerOptions = {
        definition: {
            openapi: '3.0.1',
            info: {
                title: 'Rworld API documentation',
                version: '1.0.0',
                description: 'API endpoints of the ecommerce application',
            },
        },
        apis: [`${__dirname}/docs/**/*.yaml`], // Path to your API documentation
    };
    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    return swaggerSpec;
}

export default configureSwagger;