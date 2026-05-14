import mongoose, { InferSchemaType } from "mongoose";

export const DamageSeverity = ["low", "mid", "high"] as const;
export type DamageSeverity = (typeof DamageSeverity)[number];

const damageSchema = new mongoose.Schema(
  {
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Claim",
      required: [true, "Claim ID is required"],
      index: true,
    },

    part: {
      type: String,
      required: [true, "Part is required"],
      trim: true,
      minlength: [1, "Part is required"],
      maxlength: [120, "Part cannot exceed 120 characters"],
    },

    severity: {
      type: String,
      enum: {
        values: DamageSeverity,
        message: "Severity must be one of: low, mid, high",
      },
      required: [true, "Severity is required"],
    },

    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [1, "Score must be at least 1"],
      max: [10, "Score cannot exceed 10"],
    },
  },
  {
    timestamps: true,
  },
);

export type Damage = InferSchemaType<typeof damageSchema>;

export const DamageModel = mongoose.model("Damage", damageSchema);
