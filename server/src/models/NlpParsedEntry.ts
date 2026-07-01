import mongoose, { Schema, type InferSchemaType } from "mongoose";

const nlpParsedEntrySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    rawText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    habitName: String,
    action: String,
    quantity: Number,
    unit: String,
    date: Date,
    category: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    needsConfirmation: {
      type: Boolean,
      default: true
    },
    message: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

nlpParsedEntrySchema.index({ userId: 1, createdAt: -1 });

export type NlpParsedEntry = InferSchemaType<typeof nlpParsedEntrySchema>;
export const NlpParsedEntryModel = mongoose.model<NlpParsedEntry>(
  "NlpParsedEntry",
  nlpParsedEntrySchema
);
