import mongoose, { Schema, type InferSchemaType } from "mongoose";

const progressHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    habitId: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    completedQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    completionPercentage: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

progressHistorySchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

export type ProgressHistory = InferSchemaType<typeof progressHistorySchema>;
export const ProgressHistoryModel = mongoose.model<ProgressHistory>(
  "ProgressHistory",
  progressHistorySchema
);
