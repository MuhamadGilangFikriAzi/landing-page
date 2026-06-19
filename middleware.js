const rateLimit = require('../server.js');

module.exports = {
  requireAuth(req, res, next) {
    if (!req.session.userId) return res.redirect('/login');
    next();
  },
  requireAdmin(req, res, next) {
    if (!req.session.userId || req.session.role !== 'admin') return res.redirect('/login');
    next();
  },
  requireCustomer(req, res, next) {
    if (!req.session.userId || req.session.role !== 'customer') return res.redirect('/login');
    next();
  }
};
