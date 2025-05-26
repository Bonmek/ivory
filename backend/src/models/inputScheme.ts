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

export const inputSetSuiNameServiceScheme = z.object({
  object_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  sui_ns: z.string().regex(/^0x[a-fA-F0-9]{64}$/)
})

//Use when error occurs and we need to delete the blob
export const inputSetDeleteErrorScheme = z.object({
  object_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  status: z.literal("3"),
})

export const inputSetSiteStatusScheme = z.object({
  object_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  site_status: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  status: z.union([z.literal("0"), z.literal("1"), z.literal("2"), z.literal("3")]),
})

const baseSiteScheme = z.object({
  "site-name": z.string().min(1),
  root: z.string(),
  owner: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  ownership: z.union([z.literal("0"), z.literal("1")]),
  send_to: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  epochs: z.string().regex(/^\d+$/),
  status: z.union([z.literal("0"), z.literal("1"), z.literal("2"), z.literal("3")]),
  cache: z.string().regex(/^\d+$/),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start_date",
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end_date",
  }),
})

export const inputPreviewSiteScheme = baseSiteScheme.extend({
  is_build: z.union([z.literal("0"), z.literal("1")]),
  output_dir: z.string(),
  default_route: z.string(),
  install_command: z.string().min(3),
  build_command: z.string().min(3),
}).superRefine((data, ctx) => {
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

export const inputWriteBlobScheme = baseSiteScheme

// export const inputWriteBlobScheme = baseSiteScheme.extend({
//   uuid: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i).nullable(),
//   blob_id: z.string().regex(/^0x[a-fA-F0-9]{64}$/).nullable(),
// }).superRefine((data, ctx) => {
//   const start = Date.parse(data.start_date);
//   const end = Date.parse(data.end_date);
//   if (!isNaN(start) && !isNaN(end) && end <= start) {
//     ctx.addIssue({
//       path: ["end_date"],
//       code: z.ZodIssueCode.custom,
//       message: "end_date must be after start_date",
//     });
//   }
// });
