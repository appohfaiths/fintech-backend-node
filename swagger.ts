import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Fintech API Documentation',
            version: '1.0.0',
            description: 'API documentation',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'https',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        servers: [
            {
                url: `http://localhost:8181/`,
            },
            {
                url: `http://localhost:8080/`,
            },
        ],
    },
    apis: ['./build/routes/**/*.js', './routes/**/*.ts'], // Adjust the path to match your route files
};

const options = {
    customCss: '.swagger-ui .topbar .topbar-wrapper .link { display: none }',
    customSiteTitle: 'fintech-api',
    customfavIcon:
        '',
    explorer: true,
};


const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

export default app