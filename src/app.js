import express from 'express';
import path from 'path';
import handlebars from 'express-handlebars';
import cookieParser from 'cookie-parser';
import { expressjwt as jwt } from "express-jwt";
import passport from './config/passportConfig.js';
import config from './config/config.js';
import logger from './utils/logger.js';
import logError from './utils/errorHandler.js';
import configureSocketIO from './config/socketIO.js';
import configureSwagger from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';

// Route imports
import { router as productRouter } from './routes/products.js';
import { router as cartRouter } from './routes/carts.js';
import { router as viewsRouter } from './routes/views.js';
import { router as authRouter } from './routes/auth.js';
import { router as devRouter } from './routes/dev.js';
import { router as userRouter } from './routes/users.js';

// Express initialization
const app = express();
const __dirname = path.resolve();

// Express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/profiles', express.static(path.join(__dirname, 'uploads/profiles')));
app.use('/products', express.static(path.join(__dirname, 'uploads/products')));


// Passport initialization
app.use(passport.initialize());

// Handlebars configuration
app.engine('hbs', handlebars.engine({ 
    extname: '.hbs',
    defaultLayout: 'main', 
    layoutsDir: path.join(__dirname, 'src/views/layouts'),
    partialsDir: path.join(__dirname, 'src/views/partials'),
    helpers: {
        eq: (v1, v2) => v1 === v2,
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

// Cookie parser middleware
app.use(cookieParser());

// JWT middleware
app.use(jwt({ 
    secret: config.auth.jwtSecret, 
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: req => req.cookies.jwt
}));

// Swagger configuration
const swaggerSpec = configureSwagger()

// Routes
app.use('/', viewsRouter);
app.use('/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/api/dev', devRouter);
app.use('/api/users', userRouter);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Wildcard route for handling 404 Not Found
app.get('*', (req, res) => {
    res.status(404).render('error', { message: 'Page does not exist', user: req.auth });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logError(err);
    res.status(500).render('error', { message: 'Internal Server Error' });
});

// Server initialization
const httpServer = app.listen(config.server.port, () => {
    logger.info(`Selected environment: ${config.server.mode}`);
    logger.info(`Server is running at PORT ${config.server.port}`);

    // Socket.io configuration
    configureSocketIO(httpServer);
});

export { app };
