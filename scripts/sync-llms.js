#!/usr/bin/env node

/**
 * Sync llms.txt to llms.md
 * 
 * This script creates a duplicate of llms.txt as llms.md
 * Useful for viewing the documentation with markdown rendering
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const SOURCE_FILE = path.join(ROOT_DIR, 'llms.txt');
const TARGET_FILE = path.join(ROOT_DIR, 'llms.md');

function syncLlms() {
  try {
    // Check if source file exists
    if (!fs.existsSync(SOURCE_FILE)) {
      console.error('❌ Error: llms.txt not found');
      process.exit(1);
    }

    // Read the source file
    const content = fs.readFileSync(SOURCE_FILE, 'utf8');

    // Write to target file
    fs.writeFileSync(TARGET_FILE, content, 'utf8');

    // Get file sizes
    const sourceSize = fs.statSync(SOURCE_FILE).size;
    const targetSize = fs.statSync(TARGET_FILE).size;

    console.log('✅ Successfully synced llms.txt to llms.md');
    console.log(`   Source: ${SOURCE_FILE} (${sourceSize} bytes)`);
    console.log(`   Target: ${TARGET_FILE} (${targetSize} bytes)`);
    console.log('');
    console.log('📝 Note: llms.md is a duplicate for markdown rendering');
    console.log('   Always edit llms.txt, then run this script to sync');

  } catch (error) {
    console.error('❌ Error syncing files:', error.message);
    process.exit(1);
  }
}

// Run the sync
syncLlms();

