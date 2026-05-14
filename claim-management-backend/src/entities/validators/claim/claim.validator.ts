import z from "zod";
import { ClaimStatus } from "../../models/claim/claim.model";

const createClaimSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    status: z
      .enum(ClaimStatus, {
        message: `Status must be one of: ${ClaimStatus.join(", ")}`,
      })
      .optional(),
  })
  .strict();

const updateClaimSchema = z
  .object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    status: z
      .enum(ClaimStatus, {
        message: `Status must be one of: ${ClaimStatus.join(", ")}`,
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .strict();

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
export { createClaimSchema, updateClaimSchema };
