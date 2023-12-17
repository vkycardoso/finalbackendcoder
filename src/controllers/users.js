import multer from 'multer';
import path from 'path';
import emailTransporter from '../config/email.js';
import logError from "../utils/errorHandler.js";
import UsersService from "../services/users.js";
import generateJwtToken from '../utils/jwt.js';

const __dirname = path.resolve();

class UsersController {
  static async changeUserRole(req, res) {
    const { userId } = req.params;

    try {
      const user = await UsersService.changeUserRole(userId);
      const userPublicData = UsersService.getUserPublicData(user);
      res.status(200).json({status: 'success', payload: userPublicData});
    } catch (error) {
      logError(error);
      res.status(500).json({ status: 'error', payload: error.message });
    }
  }

  static async deleteUser(req, res) {
    const { userId } = req.params;

    try {
      const user = await UsersService.deleteUser(userId);
      const userPublicData = UsersService.getUserPublicData(user);
      res.status(200).json({status: 'success', payload: userPublicData});
    } catch (error) {
      logError(error);
      res.status(500).json({ status: 'error', payload: error.message });
    }
  }

  static currentUser(req,res) {
    const userPublicData = UsersService.getUserPublicData(req.auth);
    return res.json({ status: 'success', payload: userPublicData });
  }

  static async uploadProfileImage(req, res) {
    const storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '/uploads/profiles'));
      },
      filename: function(req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const newFileName = `${req.auth._id}${fileExtension}`;
        req.newFileName = newFileName;
        cb(null, newFileName);
      }
    });
  
    const upload = multer({ storage: storage }).single('image');
  
    upload(req, res, async function(err) {
      if (err) {
        logError(err);
        return res.redirect('/profile-update-failed');
      }
  
      try {
        // Update user's profile image in the database using the filename from req.newFileName
        await UsersService.updateUserById(req.auth._id, { profileImg: req.newFileName });

        const token = await generateJwtToken(req.auth._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3600000});

        res.redirect('/profile');
      } catch (error) {
        res.redirect('/profile-update-failed');
      }
    });
  }  

  static uploadDocuments(req, res, next) {
    // Configure multer
    const storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, path.join(__dirname, 'uploads/documents'));
      },
      filename: function(req, file, cb) {
        let newFileName = '';

        switch (file.fieldname) {
          case 'identification':
            newFileName = `${req.auth._id}_identification.pdf`;
            break;
          case 'proofOfAddress':
            newFileName = `${req.auth._id}_address.pdf`;
            break;
          case 'bankStatement':
            newFileName = `${req.auth._id}_bank.pdf`;
            break;
          default:
            newFileName = `unknown_${Date.now()}${path.extname(file.originalname)}`;
        }

        cb(null, newFileName);
      }
    });

    const upload = multer({ storage: storage });

    const uploadMiddleware = upload.fields([
      { name: 'identification', maxCount: 1 },
      { name: 'proofOfAddress', maxCount: 1 },
      { name: 'bankStatement', maxCount: 1 }
    ]);

    uploadMiddleware(req, res, function(err) {
      if (err) {
        return res.status(200).json({ status: 'error', payload: 'Error while loading your request.' });
      }
      
      if (!req.files['identification'] || !req.files['proofOfAddress'] || !req.files['bankStatement']) {
        return res.status(200).json({ status: 'error', payload: 'One or more of the files are missing.' });
      } 
      
      return res.status(200).json({ status: 'success', payload: 'Documents uploaded successfully.' });
    });
  }

  static async deleteInactiveUsers(req, res) {
    let inactiveUsers = [];
    try {
      inactiveUsers = await UsersService.deleteInactiveUsers();
    } catch (error) {
      logError(error);
      res.status(500).json({ status: 'error', payload: error.message });
    }

    inactiveUsers.forEach(async user => {
      
      const mailOptions = {
        from: 'rworld@coder.com',
        to: user.email,
        subject: 'Deleted account',
        text: `Hi. \n\nYour account has been deleted due to inactivity. \n\nRegards, \n\nRWorld Team`
      };

      try {
        await emailTransporter.sendMail(mailOptions);
      } catch (error) {
        logError(error);
      }

    });
    const inactiveUsersPublicData = inactiveUsers.map(user => UsersService.getUserPublicData(user));
    res.status(200).json({status: 'success', payload: inactiveUsersPublicData});
  }

}

export default UsersController;