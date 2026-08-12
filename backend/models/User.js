const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows null for other auth methods
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    default: ''
  },

  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  profilePicture: {
    type: String
  },
  // Authentication provider: 'google' or 'local'
  authProvider: {
    type: String,
    enum: ['google', 'local'],
    default: 'google'
  },
  // Password for local authentication
  password: {
    type: String,
    select: false // Don't return password in queries
  },
  
  // Google Identity Services (GIS) fields for credential-based OAuth
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  // User preferences and settings
  preferences: {
    theme: {
      type: String,
      default: 'dark',
      enum: ['light', 'dark', 'system']
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  // User stats
  stats: {
    qrCodesCreated: {
      type: Number,
      default: 0
    },
    totalScans: {
      type: Number,
      default: 0
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  // Subscription and trial information
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'ultra'],
      default: 'free'
    },
    trialEndsAt: {
      type: Date,
      default: function() {
        // Set trial to end 1 week from account creation
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
        return oneWeekFromNow;
      }
    },
    subscribedAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    // Stripe subscription fields
    stripeCustomerId: {
      type: String
    },
    stripeSubscriptionId: {
      type: String
    },
    stripePriceId: {
      type: String
    },
    stripeCurrentPeriodEnd: {
      type: Date
    },
    stripeCancelAtPeriodEnd: {
      type: Boolean,
      default: false
    }
  },
  // User assets
  stickers: [{
    id: {
      type: String,
      required: true
    },
    data: {
      type: String, // Base64 encoded image data or emoji
      required: true
    },
    name: {
      type: String,
      default: 'Untitled Sticker'
    },
    category: {
      type: String,
      default: 'custom'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  logos: [{
    id: {
      type: String,
      required: true
    },
    data: {
      type: String, // Base64 encoded image data
      required: true
    },
    name: {
      type: String,
      default: 'Untitled Logo'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  qrCodes: [{
    id: {
      type: String,
      required: true
    },
    data: {
      type: String, // QR code data/URL
      required: true
    },
    imageData: {
      type: String, // Base64 encoded QR code image
      required: true
    },
    name: {
      type: String,
      default: 'SCAN ME'
    },
    category: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    notes: {
      type: String,
      default: ''
    },
    scans: {
      type: Number,
      default: 0
    },

    createdAt: {
      type: Date,
      default: Date.now
    },
    lastScanned: {
      type: Date,
      default: Date.now
    },
    scanHistory: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: {
        type: String
      },
      userAgent: {
        type: String
      },
      location: {
        city: String,
        region: String,
        country: String,
        countryCode: String
      },
      device: {
        type: {
          type: String,
          enum: ['phone', 'tablet', 'desktop', 'bot', 'other']
        },
        brand: String,
        model: String,
        os: {
          name: String,
          version: String
        },
        browser: {
          name: String,
          version: String
        }
      }
    }]
  }],
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (next && typeof next === 'function') {
    next();
  }
});

// Method to get public user profile (without sensitive data)
UserSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.googleId;
  delete userObject.__v;
  return userObject;
};

// Static method to find or create user from Google profile
UserSchema.statics.findOrCreate = async function(profile) {
  console.log('=== User.findOrCreate ===');
  console.log('Looking for user with Google ID:', profile.id);
  
  try {
    let user = await this.findOne({ googleId: profile.id });
    
    if (!user) {
      console.log('No user found with Google ID, checking email:', profile.emails?.[0]?.value);
      // Also check if user exists with same email
      user = await this.findOne({ email: profile.emails[0].value });
      
      if (!user) {
        console.log('Creating new user with email:', profile.emails[0].value);
        // Create new user
        user = new this({
          googleId: profile.id,
          email: profile.emails[0].value,
          displayName: profile.displayName,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          profilePicture: profile.photos?.[0]?.value,
          authProvider: 'google',
          isVerified: true // Google verified emails are considered verified
        });
      } else {
        console.log('Found existing user with email, linking Google account:', user.email);
        // Link existing user with Google account
        user.googleId = profile.id;
        user.authProvider = 'google';
        user.profilePicture = profile.photos?.[0]?.value || user.profilePicture;
        user.isVerified = true;
      }
      
      await user.save();
      console.log('User saved successfully:', user.email);
    } else {
      console.log('Found existing user with Google ID:', user.email);
    }
    
    return user;
  } catch (error) {
    console.error('=== Error in User.findOrCreate ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    
    // If database is not available, create a mock user for development
    if (error.name === 'MongoServerSelectionError' || error.message.includes('ECONNREFUSED')) {
      console.warn('Database not available, creating mock user for development');
      const mockUser = {
        _id: 'mock-user-' + Date.now(),
        googleId: profile.id,
        email: profile.emails?.[0]?.value || 'user@example.com',
        displayName: profile.displayName || 'Mock User',
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        profilePicture: profile.photos?.[0]?.value,
        isVerified: true,
        getPublicProfile: function() {
          return {
            id: this._id,
            email: this.email,
            displayName: this.displayName,
            firstName: this.firstName,
            lastName: this.lastName,
            profilePicture: this.profilePicture,
            isDemo: true
          };
        }
      };
      return mockUser;
    }
    
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);