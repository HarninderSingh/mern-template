import { Schema, models, model, type Document } from "mongoose"

export interface IPasswordResetToken extends Document {
  email: string
  token: string
  expiresAt: Date
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
})

const PasswordResetToken =
  models.PasswordResetToken || model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema)

export default PasswordResetToken
