import mongoose, { InferSchemaType } from "mongoose";

export const DAMAGE_SEVERITY = {
  LOW: "low",
  MID: "mid",
  HIGH: "high",
} as const;

export const DAMAGE_SEVERITY_VALUES = Object.values(DAMAGE_SEVERITY);
export type DamageSeverity = (typeof DAMAGE_SEVERITY)[keyof typeof DAMAGE_SEVERITY];

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
        values: DAMAGE_SEVERITY_VALUES,
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
  },
  {
    timestamps: true,
  },
);

export type Damage = InferSchemaType<typeof damageSchema>;

export const DamageModel = mongoose.model("Damage", damageSchema);
