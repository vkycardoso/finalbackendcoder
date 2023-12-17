import JwtStrategy from 'passport-jwt';
import passport from 'passport';
import config from './config.js';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UsersService from '../services/users.js';
import logError from '../utils/errorHandler.js';

const jwtFromRequest = (req) => {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies['jwt'];
        }
        return token;
    };

passport.use(new JwtStrategy.Strategy({
    jwtFromRequest : jwtFromRequest,
    secretOrKey : config.auth.jwtSecret
}, async (jwt_payload, done) => {
    try {
        const user = await UsersService.getUserById(jwt_payload._id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

passport.use('signupStrategy', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    async (req, email, password, done) => {
        try {
            const userData = { ...req.body, email, password };
            const user = await UsersService.registerUser(userData);
            return done(null, user);
        } catch (error) {
            logError(error)
            return done(null, false, { message: error.message });
        }
    }
));

passport.use('loginStrategy', new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
    },
    async (email, password, done) => {
        try {
            const user = await UsersService.loginUser(email, password);
            return done(null, user);
        } catch (error) {
            return done(null, false, { message: error.message });
        }
    }
));

passport.use('githubStrategy', new GitHubStrategy(
    {
        clientID: config.auth.github.clientId,
        clientSecret: config.auth.github.secretKey,
        callbackURL: config.auth.github.callbackUrl
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const userData = {
                firstName: profile.username,
                lastName: `(${profile.provider})`,
                email: profile.username,
            };
            const user = await UsersService.loginOrCreateUser(userData);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use('googleStrategy', new GoogleStrategy(
    {
        clientID: config.auth.google.clientId,
        clientSecret: config.auth.google.secretKey,
        callbackURL: config.auth.google.callbackUrl
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const userData = {
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
            };
            const user = await UsersService.loginOrCreateUser(userData);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

export default passport;
