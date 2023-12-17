import UsersService from "../src/services/users.js";
//import ProductsService from "../src/services/products.js";
import config from "../src/config/config.js";
import generateJwtToken from "../src/utils/jwt.js";

async function setupUser(type) {
    let email, password, role;

    switch (type) {
        case 'regular':
            email = config.test.regularUser.email;
            password = config.test.regularUser.pass;
            role = 'user';
            break;
        case 'premium':
            email = config.test.premiumUser.email;
            password = config.test.premiumUser.pass;
            role = 'premium';
            break;
        case 'admin':
            email = config.test.adminUser.email;
            password = config.test.adminUser.pass;
            role = 'admin';
            break;
        default:
            throw new Error('Invalid user type specified');
    }

    const data = { email, password, firstName: 'Test', lastName: 'Test' };
    const user = await UsersService.registerUser(data);
    await UsersService.updateUserById(user._id, { role });
    const token = await generateJwtToken(user._id);
    return token;
}

export {setupUser}