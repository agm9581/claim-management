import { z } from "zod";
import { DamageSeverity } from "../../models/damage/damage.model";

export const createDamageSchema = z
  .object({
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
  })
  .strict();

export const updateDamageSchema = createDamageSchema
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateDamageInput = z.infer<typeof createDamageSchema>;
export type UpdateDamageInput = z.infer<typeof updateDamageSchema>;
