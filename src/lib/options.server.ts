import { createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";

const envSchema = z.object({
  ttlSeconds: z.coerce.number().positive().int().optional().default(300),
  mailRoot: z.string().nonempty().optional().default("/var/mail"),
});

export const getOptions = createServerOnlyFn(() => {
  try {
    return envSchema.parse(
      Object.fromEntries(
        Object.entries(process.env)
          .filter((tuple) => /^EML_/i.test(tuple[0]))
          .map((tuple) => [
            tuple[0]
              .substring(4)
              .toLowerCase()
              .replaceAll(/_./g, (match) => match.substring(1).toUpperCase()),
            tuple[1],
          ]),
      ),
    );
  } catch (error) {
    console.error("Failed to parse env", error);
    return envSchema.parse({}); // gets defaults
  }
});
