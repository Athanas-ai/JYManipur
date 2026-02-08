
import { z } from 'zod';
import { insertIntentionSchema, insertChallengeSchema, intentions, challenges } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Public Routes
  intentions: {
    list: {
      method: 'GET' as const,
      path: '/api/intentions' as const,
      responses: {
        200: z.array(z.custom<typeof intentions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/intentions' as const,
      input: insertIntentionSchema,
      responses: {
        201: z.custom<typeof intentions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    increment: {
      method: 'POST' as const,
      path: '/api/intentions/:id/pray' as const,
      input: z.object({ type: z.enum(['hailMary', 'ourFather', 'rosary']) }),
      responses: {
        200: z.custom<typeof intentions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  challenges: {
    active: {
      method: 'GET' as const,
      path: '/api/challenges/active' as const,
      responses: {
        200: z.custom<typeof challenges.$inferSelect>().nullable(),
      },
    },
    increment: {
      method: 'POST' as const,
      path: '/api/challenges/:id/increment' as const,
      responses: {
        200: z.custom<typeof challenges.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  
  // Admin Routes (Protected)
  admin: {
    challenges: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/challenges' as const,
        responses: {
          200: z.array(z.custom<typeof challenges.$inferSelect>()),
          403: errorSchemas.forbidden,
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/challenges' as const,
        input: insertChallengeSchema,
        responses: {
          201: z.custom<typeof challenges.$inferSelect>(),
          403: errorSchemas.forbidden,
          400: errorSchemas.validation,
        },
      },
      update: {
        method: 'PUT' as const,
        path: '/api/admin/challenges/:id' as const,
        input: insertChallengeSchema.partial(),
        responses: {
          200: z.custom<typeof challenges.$inferSelect>(),
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/challenges/:id' as const,
        responses: {
          204: z.void(),
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
    },
    intentions: {
      markPrinted: {
        method: 'POST' as const,
        path: '/api/admin/intentions/:id/printed' as const,
        responses: {
          200: z.custom<typeof intentions.$inferSelect>(),
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
