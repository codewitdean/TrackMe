import mongoose, { Schema, type InferSchemaType } from "mongoose";

const habitLogSchema = new Schema(
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
    rawText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    parsedHabitName: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

habitLogSchema.index({ userId: 1, date: -1 });

export type HabitLog = InferSchemaType<typeof habitLogSchema>;
export const HabitLogModel = mongoose.model<HabitLog>("HabitLog", habitLogSchema);
