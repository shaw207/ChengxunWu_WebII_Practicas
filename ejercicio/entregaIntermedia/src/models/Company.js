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

const companySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El owner es obligatorio'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    cif: {
      type: String,
      required: [true, 'El CIF es obligatorio'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    address: {
      type: addressSchema,
      default: () => ({})
    },
    logo: {
      type: String,
      default: null
    },
    isFreelance: {
      type: Boolean,
      default: false
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
    versionKey: false
  }
);

const excludeDeleted = function () {
  if (!this.getOptions().withDeleted) {
    this.where({ deleted: { $ne: true } });
  }
};

companySchema.pre('find', excludeDeleted);
companySchema.pre('findOne', excludeDeleted);
companySchema.pre('findOneAndUpdate', excludeDeleted);
companySchema.pre('countDocuments', excludeDeleted);

companySchema.methods.softDelete = async function () {
  this.deleted = true;
  this.deletedAt = new Date();
  return this.save();
};

companySchema.statics.findWithDeleted = function (filter = {}) {
  return this.find(filter).setOptions({ withDeleted: true });
};

companySchema.statics.findOneWithDeleted = function (filter = {}) {
  return this.findOne(filter).setOptions({ withDeleted: true });
};

const Company = mongoose.model('Company', companySchema);

export default Company;
