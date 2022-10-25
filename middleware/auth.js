module.exports = (req, res, next) => {
    if (req.session.token) {
        return next();
    }

    return res.redirect('/login?error=Please, do login');
}