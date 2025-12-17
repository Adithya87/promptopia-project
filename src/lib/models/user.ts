import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  name: string;
  image?: string;
  bio?: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, default: '' },
    image: { type: String, default: '' },
    bio: { type: String, default: '' },
    profileComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model<UserDocument>('User', UserSchema);

export default User;
