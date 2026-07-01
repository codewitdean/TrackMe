import bcrypt from "bcryptjs";
import mongoose, {
  type CallbackWithoutResultAndOptionalError,
  Schema,
  type HydratedDocument,
  type Model
} from "mongoose";

export const userRoles = ["user", "admin"] as const;
export type UserRole = (typeof userRoles)[number];

export interface User {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModelType = Model<User, {}, UserMethods>;
export type UserDocument = HydratedDocument<User, UserMethods>;

const userSchema = new Schema<User, UserModelType, UserMethods>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: userRoles,
      default: "user"
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function hashPassword(
  this: UserDocument,
  next: CallbackWithoutResultAndOptionalError
) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(this: UserDocument, candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const UserModel = mongoose.model<User, UserModelType>("User", userSchema);
