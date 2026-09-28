export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Amroh Majelis Ta'lim API",
    version: "1.0.0",
    description:
      "REST API untuk sinkronisasi konten majelis ta'lim. Endpoint `/api/v1` wajib memakai header `X-API-Key`.",
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    { name: "Health", description: "Status layanan" },
    { name: "Database", description: "Versi dan snapshot konten" },
    { name: "Categories", description: "Kategori bacaan" },
    { name: "Contents", description: "Bacaan dan section" },
    { name: "Admin", description: "Publish snapshot (scope admin)" },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
        description: "API key scope `app` atau `admin`",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "unauthorized" },
          message: { type: "string" },
        },
      },
      Health: {
        type: "object",
        properties: {
          status: { type: "string", example: "ok" },
          uptime: { type: "number" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      Readiness: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ok", "unhealthy"] },
          checks: {
            type: "object",
            properties: {
              mongodb: { type: "string", example: "connected" },
            },
          },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Group Amalan" },
          slug: { type: "string", example: "amalan" },
          description: { type: "string", nullable: true },
          sort_order: { type: "integer", example: 1 },
          is_active: { type: "boolean" },
        },
      },
      Content: {
        type: "object",
        properties: {
          id: { type: "integer" },
          category_id: { type: "integer" },
          title: { type: "string" },
          slug: { type: "string" },
          description: { type: "string", nullable: true },
          content_type: { type: "string", enum: ["single", "multiple"] },
          numbering: { type: "boolean" },
          sort_order: { type: "integer" },
          is_active: { type: "boolean" },
          status: { type: "string", enum: ["draft", "published"] },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      ContentSection: {
        type: "object",
        properties: {
          id: { type: "integer" },
          content_id: { type: "integer" },
          section_type: { type: "string", example: "bacaan" },
          title: { type: "string", nullable: true },
          arabic: { type: "string" },
          transliteration: { type: "string" },
          translation: { type: "string" },
          sort_order: { type: "integer" },
        },
      },
      DatabaseVersion: {
        type: "object",
        properties: {
          version: { type: "integer", example: 1 },
          updated_at: { type: "string", format: "date-time" },
          size: { type: "integer" },
          checksum: { type: "string", example: "sha256:..." },
          download_url: {
            type: "string",
            example: "/api/v1/database/download/1",
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "API key missing atau invalid",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      Forbidden: {
        description: "Scope API key tidak sesuai",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      NotFound: {
        description: "Resource tidak ditemukan",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Liveness check",
        description: "Menandakan proses API masih berjalan. Tidak memerlukan API key.",
        responses: {
          200: {
            description: "API hidup",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Health" },
              },
            },
          },
        },
      },
    },
    "/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness check",
        description: "Mengecek koneksi MongoDB. Tidak memerlukan API key.",
        responses: {
          200: {
            description: "Siap menerima traffic",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Readiness" },
              },
            },
          },
          503: {
            description: "MongoDB tidak siap",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Readiness" },
              },
            },
          },
        },
      },
    },
    "/api/v1/database/version": {
      get: {
        tags: ["Database"],
        summary: "Get database version",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: {
            description: "Versi snapshot terkini",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DatabaseVersion" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/v1/database/download": {
      get: {
        tags: ["Database"],
        summary: "Download snapshot terkini",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: {
            description: "File snapshot JSON",
            content: {
              "application/json": { schema: { type: "object" } },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/v1/database/download/{version}": {
      get: {
        tags: ["Database"],
        summary: "Download snapshot database",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "version",
            in: "path",
            required: false,
            schema: { type: "integer" },
            description: "Nomor versi. Kosongkan untuk versi terkini.",
          },
        ],
        responses: {
          200: {
            description: "File snapshot JSON",
            content: {
              "application/json": { schema: { type: "object" } },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/v1/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        security: [{ ApiKeyAuth: [] }],
        responses: {
          200: {
            description: "Daftar kategori aktif",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "integer", nullable: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/api/v1/contents": {
      get: {
        tags: ["Contents"],
        summary: "List contents",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "category",
            in: "query",
            required: false,
            schema: { type: "string", example: "tawassul" },
            description: "Filter berdasarkan slug kategori",
          },
        ],
        responses: {
          200: {
            description: "Daftar konten published",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "integer", nullable: true },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Content" },
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/v1/contents/{slug}": {
      get: {
        tags: ["Contents"],
        summary: "Get content by slug",
        security: [{ ApiKeyAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", example: "maulid-diba" },
          },
        ],
        responses: {
          200: {
            description: "Konten beserta sections",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    version: { type: "integer", nullable: true },
                    data: {
                      allOf: [
                        { $ref: "#/components/schemas/Content" },
                        {
                          type: "object",
                          properties: {
                            sections: {
                              type: "array",
                              items: { $ref: "#/components/schemas/ContentSection" },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/api/v1/admin/publish": {
      post: {
        tags: ["Admin"],
        summary: "Publish snapshot baru",
        security: [{ ApiKeyAuth: [] }],
        description: "Memerlukan API key dengan scope `admin`.",
        responses: {
          200: {
            description: "Snapshot baru diterbitkan",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DatabaseVersion" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          403: { $ref: "#/components/responses/Forbidden" },
        },
      },
    },
  },
};
