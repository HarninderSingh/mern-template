import { Schema, models, model, type Document } from "mongoose"

export interface IUser extends Document {
  name?: string
  email: string
  password?: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false, // Not required for OAuth users
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
)

const User = models.User || model<IUser>("User", UserSchema)

export default User
