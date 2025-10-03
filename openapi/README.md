# OpenAPI Documentation Structure

This directory contains the OpenAPI specification for the Ditto Server API, organized in a modular structure that allows for both standalone usage and consolidated generation.

## Structure

```
openapi/
├── README.md                    # This documentation
├── base.yaml                    # Base OpenAPI template with common metadata
├── openapi.yaml                 # Main OpenAPI spec with references to sections
├── openapi-consolidated.yaml    # Generated consolidated spec (auto-generated)
└── sections/                    # Individual API section files
    ├── auth.yaml               # Authentication endpoints
    ├── chat.yaml               # Chat messaging endpoints
    ├── debug.yaml              # Debug endpoints (development only)
    ├── health.yaml             # Health check endpoints
    └── users.yaml              # User management endpoints
```

## Usage

### Individual Section Files

Each file in the `sections/` directory is a **complete, standalone OpenAPI document** that can be imported directly into tools like RapidAPI, Postman, or any OpenAPI-compatible tool.

**Benefits:**
- ✅ **Importable**: Each section can be imported independently
- ✅ **Valid**: Contains all required OpenAPI metadata
- ✅ **Focused**: Only includes relevant endpoints for that section
- ✅ **Maintainable**: Easy to update specific sections without affecting others

**Available sections:**
- `sections/auth.yaml` - Phone-based OTP authentication
- `sections/chat.yaml` - 1-to-1 chat messaging
- `sections/debug.yaml` - Development and debugging tools
- `sections/health.yaml` - Health checks and monitoring
- `sections/users.yaml` - User management and profiles

### Consolidated Specification

The `openapi-consolidated.yaml` file contains the complete API specification with all endpoints combined.

**Generated automatically** using:
```bash
npm run generate-openapi
```

**Benefits:**
- ✅ **Complete**: All endpoints in one file
- ✅ **Auto-generated**: Always up-to-date with section files
- ✅ **Consistent**: Uses shared metadata and components

## Workflow

### Making Changes

1. **Edit individual section files** in `sections/` directory
2. **Run the generation script** to update the consolidated spec:
   ```bash
   npm run generate-openapi
   ```
3. **Import only the changed section** into your API tool

### Adding New Sections

1. Create a new YAML file in `sections/` directory
2. Include the complete OpenAPI structure:
   ```yaml
   openapi: 3.0.3
   info:
     title: Ditto Server API - [Section Name]
     description: |
       [Section description]
     version: 1.0.0
     contact:
       name: Ditto Server
     license:
       name: MIT
   servers:
     - url: http://localhost:3000
       description: Local development server
   security:
     - apiSecret: []
   
   paths:
     # Your endpoints here
   
   components:
     securitySchemes:
       bearerAuth:
         type: http
         scheme: bearer
         bearerFormat: JWT
       apiSecret:
         type: apiKey
         in: header
         name: X-API-Secret
         description: API secret key required for all requests
   
   tags:
     - name: [Your Tag]
       description: [Tag description]
   ```
3. Add the new section to `scripts/generate-openapi.js` in the `SECTION_FILES` array
4. Run `npm run generate-openapi` to include it in the consolidated spec

## Importing into API Tools

### RapidAPI
1. Go to your RapidAPI project
2. Import the specific section file (e.g., `sections/auth.yaml`)
3. Only the authentication endpoints will be imported
4. Repeat for other sections as needed

### Postman
1. Import the section file directly
2. The collection will contain only the endpoints from that section
3. Import multiple sections to build a complete collection

### Other Tools
Any OpenAPI 3.0 compatible tool should work with the individual section files since they are complete, valid OpenAPI documents.

## Script Details

The `scripts/generate-openapi.js` script:
- Loads the base template (`base.yaml`)
- Merges paths from all section files
- Combines components (security schemes, schemas, etc.)
- Deduplicates tags
- Generates the consolidated specification

**Run manually:**
```bash
node scripts/generate-openapi.js
```

**Or via npm:**
```bash
npm run generate-openapi
```

## Best Practices

1. **Keep sections focused** - Each section should represent a logical API domain
2. **Use consistent naming** - Follow the pattern `Ditto Server API - [Section]` for titles
3. **Include all metadata** - Each section file must be a complete OpenAPI document
4. **Update consolidated spec** - Always run the generation script after changes
5. **Test imports** - Verify that section files work with your target API tools

## Troubleshooting

### Section file not importing
- Ensure the file contains all required OpenAPI metadata (openapi, info, servers, etc.)
- Validate the YAML syntax
- Check that all referenced security schemes are defined in components

### Consolidated spec issues
- Run `npm run generate-openapi` to regenerate
- Check that all section files are valid YAML
- Verify the script can find all section files

### Missing endpoints
- Ensure the section file is listed in `SECTION_FILES` array in the generation script
- Check that the section file contains the expected paths
