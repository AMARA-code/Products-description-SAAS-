// Middleware function to check subscription
function checkSubscription(req, res, next) {
    const user = req.user;

    // If user is not logged in, redirect to login page
    if (!user) {
        return res.redirect('/login');
    }

    // Check for valid subscription plan
    const validPlans = ['BASIC', 'PRO', 'PREMIUM'];

    // Allow access if the user is either having a valid plan or is a new BASIC user
    if (user.subscriptionPlan && (validPlans.includes(user.subscriptionPlan) || user.isNewUser)) {
        return next();
    }

    // Redirect to pricing page if no valid subscription found
    res.redirect('/pricing');
}

module.exports = checkSubscription;