#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('yamljs');

/**
 * Script to generate consolidated OpenAPI specification from individual section files
 * This allows us to maintain modular OpenAPI files while generating a complete spec
 */

const OPENAPI_DIR = path.join(__dirname, '..', 'openapi');
const SECTIONS_DIR = path.join(OPENAPI_DIR, 'sections');
const OUTPUT_FILE = path.join(OPENAPI_DIR, 'openapi-consolidated.yaml');

// Section files to include in the consolidated spec
const SECTION_FILES = [
  'health.yaml',
  'debug.yaml', 
  'users.yaml',
  'auth.yaml',
  'chat.yaml'
];

function loadYamlFile(filePath) {
  try {
    return yaml.load(filePath);
  } catch (error) {
    console.error(`Error loading YAML file ${filePath}:`, error.message);
    throw error;
  }
}

function writeYamlFile(filePath, data) {
  try {
    const yamlContent = yaml.stringify(data, 4, 2);
    fs.writeFileSync(filePath, yamlContent, 'utf8');
    console.log(`✅ Generated consolidated OpenAPI spec: ${filePath}`);
  } catch (error) {
    console.error(`Error writing YAML file ${filePath}:`, error.message);
    throw error;
  }
}

function generateConsolidatedOpenAPI() {
  console.log('🔄 Generating consolidated OpenAPI specification...');
  
  // Load the base template
  const baseTemplate = loadYamlFile(path.join(OPENAPI_DIR, 'base.yaml'));
  
  // Initialize the consolidated spec with base template
  const consolidatedSpec = {
    ...baseTemplate,
    paths: {},
    components: {
      ...baseTemplate.components
    },
    tags: [...baseTemplate.tags]
  };
  
  // Process each section file
  SECTION_FILES.forEach(sectionFile => {
    const sectionPath = path.join(SECTIONS_DIR, sectionFile);
    
    if (!fs.existsSync(sectionPath)) {
      console.warn(`⚠️  Section file not found: ${sectionFile}`);
      return;
    }
    
    console.log(`📄 Processing section: ${sectionFile}`);
    const sectionSpec = loadYamlFile(sectionPath);
    
    // Merge paths from section into consolidated spec
    if (sectionSpec.paths) {
      Object.assign(consolidatedSpec.paths, sectionSpec.paths);
    }
    
    // Merge components (security schemes, schemas, etc.)
    if (sectionSpec.components) {
      Object.keys(sectionSpec.components).forEach(componentType => {
        if (!consolidatedSpec.components[componentType]) {
          consolidatedSpec.components[componentType] = {};
        }
        Object.assign(consolidatedSpec.components[componentType], sectionSpec.components[componentType]);
      });
    }
    
    // Merge tags (avoid duplicates)
    if (sectionSpec.tags) {
      sectionSpec.tags.forEach(sectionTag => {
        const existingTag = consolidatedSpec.tags.find(tag => tag.name === sectionTag.name);
        if (!existingTag) {
          consolidatedSpec.tags.push(sectionTag);
        }
      });
    }
  });
  
  // Write the consolidated spec
  writeYamlFile(OUTPUT_FILE, consolidatedSpec);
  
  console.log('✅ Consolidated OpenAPI specification generated successfully!');
  console.log(`📊 Stats:`);
  console.log(`   - Total paths: ${Object.keys(consolidatedSpec.paths).length}`);
  console.log(`   - Total tags: ${consolidatedSpec.tags.length}`);
  console.log(`   - Security schemes: ${Object.keys(consolidatedSpec.components.securitySchemes || {}).length}`);
}

// Main execution
if (require.main === module) {
  try {
    generateConsolidatedOpenAPI();
  } catch (error) {
    console.error('❌ Error generating consolidated OpenAPI spec:', error.message);
    process.exit(1);
  }
}

module.exports = { generateConsolidatedOpenAPI };
