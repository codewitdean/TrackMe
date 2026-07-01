import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const habitFrequencies = ["daily", "weekly", "monthly", "custom"] as const;
export type HabitFrequency = (typeof habitFrequencies)[number];

const habitSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    targetValue: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    frequency: {
      type: String,
      enum: habitFrequencies,
      default: "daily"
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

habitSchema.index({ createdBy: 1, name: 1 }, { unique: true });

export type Habit = InferSchemaType<typeof habitSchema>;
export const HabitModel = mongoose.model<Habit>("Habit", habitSchema);
