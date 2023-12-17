//authorization middleware
const requireRole = ({ allowedRoles, redirectOnFailure = '/not-authorized' }) => {
  return (req, res, next) => {
    if (!req.auth || !allowedRoles.includes(req.auth.role)) {
      return res.redirect(redirectOnFailure);
    }
    next();
  };
};

const requireAuthenticated = requireRole({ allowedRoles: ['user', 'premium', 'admin'] }); 
const requireUserOrPremium = requireRole({ allowedRoles: ['user', 'premium'] });
const requirePremiumOrAdmin = requireRole({ allowedRoles: ['premium', 'admin'] });
const requireAdmin = requireRole({ allowedRoles: ['admin'] });


//redirect middleware
const redirectUnauthenticated = requireRole({ allowedRoles: ['user', 'premium', 'admin'], redirectOnFailure: '/auth/login' });

const redirectUnauthorizedOrAdmin = (req, res, next) => {
  if (!req.auth) {
    return res.redirect('/auth/login');
  } else if (req.auth.role === 'admin') {
    return res.redirect('/not-authorized');
  }
  next();
};

export { requireRole, redirectUnauthorizedOrAdmin, redirectUnauthenticated, requireAuthenticated, requireUserOrPremium, requireAdmin, requirePremiumOrAdmin };
