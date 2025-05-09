import { z } from "zod";

export const inputScheme = z
  .object({
    "site-name": z.string().min(1),
    owner: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    ownership: z.union([z.literal("0"), z.literal("1")]),
    send_to: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    epochs: z.string().regex(/^\d+$/),
    start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start_date",
    }),
    end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid end_date",
    }),
    status: z.union([z.literal("0"), z.literal("1"), z.literal("2")]),
    cache: z.string().regex(/^\d+$/, { message: "cache must be a numeric string" }),
    root: z.string().startsWith("/"),
    install_command: z.string().min(3),
    build_command: z.string().min(3),
    default_route: z.string().startsWith("/"),
    is_build: z.union([z.literal("0"), z.literal("1")]),
    sui_ns: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
  })
  .superRefine((data, ctx) => {
    const start = Date.parse(data.start_date);
    const end = Date.parse(data.end_date);

    if (!isNaN(start) && !isNaN(end) && end <= start) {
      ctx.addIssue({
        path: ["end_date"],
        code: z.ZodIssueCode.custom,
        message: "end_date must be after start_date",
      });
    }
  });