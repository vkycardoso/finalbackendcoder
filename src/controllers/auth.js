import UsersService from '../services/users.js';
import passport from '../config/passportConfig.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import emailTransporter from '../config/email.js';
import logError from '../utils/errorHandler.js';
import generateJwtToken from '../utils/jwt.js';

class AuthController {

    static async createJwtAndSetCookie(userId, res) {
        const token = await generateJwtToken(userId);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000});
    }

    static registerView(req, res,customResponse = {}) {
        return res.render('register', { ...customResponse });
    }

    static registerUser(req, res, next) {
        passport.authenticate('signupStrategy', (error, user, info) => {
            if (error) {
                logError(error);
                return res.status(400).json({ status: 'error', payload: error.message}) 
            } else if (!(user)) {
                return res.status(400).json({ status: 'error', payload: 'Unable to register user.'}) 
            } 
            return res.status(200).json({ status: 'success', payload: user}) 
        })(req, res, next);
    }

    static registrationSuccessView(req, res) {
        return AuthController.loginView(req, res, { message: 'User registered successfully. Please log in' });
    }

    static loginView(req, res, customResponse = {}) {
        return res.render('login', { ...customResponse });
    }

    static loginFailedView(req, res) {
        return AuthController.loginView(req, res, { error: 'Unable to log in' });
    }

    static restorePasswordView(req, res, customResponse = {}) {
        return res.render('restore-password', { ...customResponse });
    }

    static createNewPasswordView(req, res, customResponse = {}) {
        const { token } = req.params;
        try{
            const decoded = jwt.verify(token, config.auth.jwtSecret);
            return res.render('create-password', { ...customResponse, token });
        } catch (error) {
            return AuthController.restorePasswordView(req, res, { error: 'Link invalid or expired. Please try again.' });
        }
    }

    static async sendEmailToRestorePassword(req, res) {
        const { email } = req.body;
        let user;
        try {
            user = await UsersService.getUserByEmail(email);
        } catch (error) {
            return AuthController.restorePasswordView(req, res, { error: 'User not found' });
        }

        const jwtPayload = { email: user.email };
        const options = { expiresIn: '1h' };
        const passwordResetToken = jwt.sign(jwtPayload, config.auth.jwtSecret, options);

        const passwordResetLink = `http://localhost:${config.server.port}/auth/password/restore/confirm/${passwordResetToken}`;

        const mailOptions = {
            from: 'rworld@coder.com',
            to: email,
            subject: 'Restore password',
            text: `Restore your password by going to this link: ${passwordResetLink}`
        };

        try {
            await emailTransporter.sendMail(mailOptions);
            return AuthController.restorePasswordView(req, res, { message: `An restoration link was sent to ${email}. Please also check spam mailbox.` });
        } catch (error) {
            return AuthController.restorePasswordView(req, res, { error: 'Failed to send email.' });
        }

    }

    static async restorePassword(req, res) {
        let email;
        let user;

        const { token } = req.params;
        const { newPassword, confirmPassword } = req.body;


        try {
            const decoded = jwt.verify(token, config.auth.jwtSecret);
            email = decoded.email;
        } catch (error) {
            return AuthController.restorePasswordView(req, res, { error: 'Invalid or expired link. Please try again.' });
        }

        try {
            user = await UsersService.getUserByEmail(email);
        } catch (error) {
            return AuthController.restorePasswordView(req, res, { error: 'User not found' });
        }
    
        if (newPassword !== confirmPassword) {
            return AuthController.createNewPasswordView(req, res, { error: 'Passwords do not match' });
        }

        await UsersService.setUserPasswordByEmail(email, newPassword);
        return AuthController.loginView(req, res, { message: 'Password updated successfully. Please log in with your new password.' });
    }

    static loginUser(req, res, next) {
        passport.authenticate('loginStrategy', async (err, user, info) => {
            if (err || !user) {
                return res.redirect('/auth/login/failed');
            }
            if (!(user._id === 0)) {
                UsersService.updateLoginDate(user._id);
            }
            await AuthController.createJwtAndSetCookie(user._id, res);
            res.redirect('/'); 
        })(req, res, next);
    }

    static githubAuth(req, res, next) {
        passport.authenticate('githubStrategy')(req, res, next);
    }

    static githubAuthCallback(req, res, next) {
        passport.authenticate('githubStrategy', async (err, user, info) => {
            if (err || !user) {
                return res.redirect('/auth/login/failed');
            }
            await AuthController.createJwtAndSetCookie(user._id, res);
            UsersService.updateLoginDate(user._id);
            res.redirect('/'); 
        })(req, res, next);
    }

    static googleAuth(req, res, next) {
        passport.authenticate('googleStrategy', { scope: ['profile', 'email'] })(req, res, next);
    }

    static googleAuthCallback(req, res, next) {
        passport.authenticate('googleStrategy', async (err, user, info) => {
            if (err || !user) {
                return res.redirect('/auth/login/failed');
            }
            await AuthController.createJwtAndSetCookie(user._id, res);
            UsersService.updateLoginDate(user._id);
            res.redirect('/'); 
        })(req, res, next);
    }

    static logout(req, res) {
        if (req.auth.email !== config.admin.email) {
            UsersService.updateLoginDate(req.auth._id);
        }
        res.clearCookie('jwt');
        return res.redirect('/');
    }
    
}

export default AuthController;