const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated (supports both JWT and Passport sessions)
const requireAuth = async (req, res, next) => {
  console.log('=== Authentication check in middleware ===');
  console.log('   - Request path:', req.path);
  console.log('   - Request method:', req.method);
  console.log('   - Authorization header:', req.headers.authorization ? 'Present' : 'Not present');
  
  // Check for JWT token in Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    console.log('   - JWT token detected, attempting verification...');
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('   - JWT token verified successfully');
      console.log('   - Decoded user ID:', decoded.userId);
      console.log('   - Decoded email:', decoded.email);
      
      // Find user in database
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('   ❌ User not found in database for JWT token');
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Attach user to request object
      req.user = user;
      req.authMethod = 'jwt';
      console.log('   - User attached to request (JWT auth)');
      console.log('   - User ID:', user._id);
      console.log('   - User email:', user.email);
      console.log('   ✅ JWT authentication passed');
      return next();
    } catch (jwtError) {
      console.log('   ❌ JWT token verification failed:', jwtError.message);
      // Continue to check session authentication
    }
  }
  
  // Check Passport session authentication (for Google OAuth users)
  console.log('   - Checking Passport session authentication...');
  console.log('   - req.isAuthenticated():', req.isAuthenticated());
  console.log('   - req.user exists:', !!req.user);
  
  if (req.isAuthenticated()) {
    req.authMethod = 'session';
    console.log('   - User ID:', req.user._id);
    console.log('   - User email:', req.user.email);
    console.log('   ✅ Session authentication passed');
    return next();
  }
  
  // No valid authentication found
  console.log('   ❌ No valid authentication found');
  console.log('   - No JWT token or valid session');
  console.log('   - Returning 401 Unauthorized');
  return res.status(401).json({ error: 'Authentication required' });
};

// Create checkout session
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const { plan, successUrl, cancelUrl } = req.body;
    
    console.log('📊 === CREATE CHECKOUT SESSION ===');
    console.log('User:', req.user.email);
    console.log('Plan:', plan);
    
    // Fetch fresh user from database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate plan type
    if (!plan || !['pro', 'ultra'].includes(plan)) {
      return res.status(400).json({ error: 'Valid plan type required (pro or ultra)' });
    }
    
    // Get the price ID from environment variables
    let priceId;
    if (plan === 'pro') {
      priceId = process.env.STRIPE_PRO_PRICE_ID;
    } else if (plan === 'ultra') {
      priceId = process.env.STRIPE_ULTRA_PRICE_ID;
    }
    
    if (!priceId) {
      console.error('❌ Price ID not configured for plan:', plan);
      return res.status(500).json({ error: 'Price ID not configured' });
    }
    
    console.log('Price ID:', priceId);
    
    // Check if we have a Stripe customer ID
    let customerId = user.subscription?.stripeCustomerId;
    console.log('Existing customer ID:', customerId || 'None');
    
    // If no customer ID exists, create a new Stripe customer and save it
    if (!customerId) {
      console.log('📝 Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.username || user.displayName,
        metadata: {
          userId: user._id.toString()
        }
      });
      customerId = customer.id;
      console.log(`✅ Customer created: ${customerId}`);
      
      // Save the customer ID to the user record
      user.subscription.stripeCustomerId = customerId;
      await user.save();
      console.log('✅ Customer ID saved to user record');
    }
    
    // Create Checkout Session
    console.log('🛒 Creating checkout session...');
    const frontendOrigin = req.headers.origin || process.env.FRONTEND_LOCAL_URL || 'http://localhost:5173';
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: successUrl || `${frontendOrigin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${frontendOrigin}/pricing`,
      client_reference_id: user._id.toString(),
      metadata: {
        userId: user._id.toString(),
        plan: plan
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          plan: plan
        }
      }
    });
    
    console.log(`✅ Checkout session created: ${session.id}`);
    console.log(`   Checkout URL: ${session.url}`);
    
    res.json({
      sessionId: session.id,
      checkoutUrl: session.url,
      url: session.url
    });
    
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message
    });
  }
});

// Get subscription portal URL
router.post('/create-portal-session', requireAuth, async (req, res) => {
  try {
    const customerId = req.user.subscription?.stripeCustomerId;
    
    if (!customerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }
    
    // Get frontend URL from request origin or use environment variable
    const frontendOrigin = req.headers.origin || process.env.FRONTEND_LOCAL_URL || 'http://localhost:5173';
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${frontendOrigin}/dashboard`,
    });
    
    res.json({ url: portalSession.url });
    
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get subscription status
router.get('/subscription-status', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      plan: user.subscription.plan,
      isActive: user.subscription.isActive,
      trialEndsAt: user.subscription.trialEndsAt,
      subscribedAt: user.subscription.subscribedAt,
      expiresAt: user.subscription.expiresAt,
      stripeCurrentPeriodEnd: user.subscription.stripeCurrentPeriodEnd,
      stripeCancelAtPeriodEnd: user.subscription.stripeCancelAtPeriodEnd
    });
    
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

module.exports = router;