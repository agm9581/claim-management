import mongoose, { InferSchemaType } from "mongoose";

export const ClaimStatus = ["Pending", "In Review", "Finished"] as const;
export type ClaimStatus = (typeof ClaimStatus)[number];

const claimSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title is required"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [1, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    status: {
      type: String,
      enum: {
        values: ClaimStatus,
        message: "Status must be one of: Pending, In Review, Finished",
      },
      default: "Pending",
      required: [true, "Status is required"],
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export type Claim = InferSchemaType<typeof claimSchema>;

export const ClaimModel = mongoose.model("Claim", claimSchema);
