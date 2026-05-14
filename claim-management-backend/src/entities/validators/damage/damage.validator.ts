import { z } from "zod";
import mongoose from "mongoose";
import { DamageSeverity } from "../../models/damage/damage.model";

const objectIdSchema = z
  .string()
  .refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: "Invalid claim ID",
  });

export const createDamageSchema = z
  .object({
    claimId: objectIdSchema,

    part: z
      .string()
      .trim()
      .min(1, "Part is required")
      .max(120, "Part cannot exceed 120 characters"),

    severity: z.enum(DamageSeverity, {
      error: `Severity must be one of: ${DamageSeverity.join(", ")}`,
    }),

    imageUrl: z.string().trim().url("Image URL must be valid"),

    price: z.number().min(0, "Price cannot be negative"),

    score: z
      .number()
      .int("Score must be an integer")
      .min(1, "Score must be at least 1")
      .max(10, "Score cannot exceed 10"),
  })
  .strict();

export const updateDamageSchema = createDamageSchema
  .omit({ claimId: true })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateDamageInput = z.infer<typeof createDamageSchema>;
export type UpdateDamageInput = z.infer<typeof updateDamageSchema>;
