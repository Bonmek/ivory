import { z } from "zod";

export const inputDeleteBlobScheme = z
  .object({
    object_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  })

export const inputSetAttributesScheme = z
  .object({
    object_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    sui_ns: z.string().min(1),
})

export const inputWriteBlobScheme = z
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
    cache: z.string().regex(/^\d+$/),
    root: z.string(),
    install_command: z.string().min(3),
    build_command: z.string().min(3),
    default_route: z.string(),
    is_build: z.union([z.literal("0"), z.literal("1")]),
    sui_ns: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
    output_dir: z.string().optional(),

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

  export const inputUpdateWriteBlobScheme = z
  .object({
    old_object_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
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
    cache: z.string().regex(/^\d+$/),
    root: z.string(),
    install_command: z.string().min(3),
    build_command: z.string().min(3),
    default_route: z.string(),
    is_build: z.union([z.literal("0"), z.literal("1")]),
    sui_ns: z.string().regex(/^0x[a-fA-F0-9]{64}$/).optional(),
    output_dir: z.string().optional(),

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