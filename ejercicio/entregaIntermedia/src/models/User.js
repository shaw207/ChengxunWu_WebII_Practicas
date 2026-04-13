import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      trim: true,
      default: null
    },
    number: {
      type: String,
      trim: true,
      default: null
    },
    postal: {
      type: String,
      trim: true,
      default: null
    },
    city: {
      type: String,
      trim: true,
      default: null
    },
    province: {
      type: String,
      trim: true,
      default: null
    }
  },
  {
    _id: false
  }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'La contrasena es obligatoria'],
      select: false
    },
    name: {
      type: String,
      trim: true,
      default: null
    },
    lastName: {
      type: String,
      trim: true,
      default: null
    },
    nif: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    },
    role: {
      type: String,
      enum: ['admin', 'guest'],
      default: 'admin',
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'verified'],
      default: 'pending',
      index: true
    },
    verificationCode: {
      type: String,
      select: false,
      default: null
    },
    verificationAttempts: {
      type: Number,
      default: 3
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true,
      default: null
    },
    address: {
      type: addressSchema,
      default: () => ({})
    },
    refreshToken: {
      type: String,
      select: false,
      default: null
    },
    refreshTokenExpiresAt: {
      type: Date,
      select: false,
      default: null
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.verificationCode;
        delete ret.refreshToken;
        return ret;
      }
    },
    toObject: {
      virtuals: true
    }
  }
);

userSchema.virtual('fullName').get(function () {
  return [this.name, this.lastName].filter(Boolean).join(' ');
});

const excludeDeleted = function () {
  if (!this.getOptions().withDeleted) {
    this.where({ deleted: { $ne: true } });
  }
};

userSchema.pre('find', excludeDeleted);
userSchema.pre('findOne', excludeDeleted);
userSchema.pre('findOneAndUpdate', excludeDeleted);
userSchema.pre('countDocuments', excludeDeleted);

userSchema.methods.softDelete = async function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

userSchema.statics.findWithDeleted = function (filter = {}) {
  return this.find(filter).setOptions({ withDeleted: true });
};

userSchema.statics.findOneWithDeleted = function (filter = {}) {
  return this.findOne(filter).setOptions({ withDeleted: true });
};

const User = mongoose.model('User', userSchema);

export default User;
