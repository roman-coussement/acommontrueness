#!/usr/bin/env node
/**
 * Generates artwork/artwork.json from files in the artwork folder.
 * Run with: node generate-artwork-list.js
 * Add this to your workflow when adding new images to /artwork.
 */
const fs = require('fs');
const path = require('path');

const artworkDir = path.join(__dirname, 'artwork');
const outputPath = path.join(artworkDir, 'artwork.json');
const ext = /\.(jpg|jpeg|png|avif|webp|gif)$/i;

const files = fs.readdirSync(artworkDir)
  .filter(f => ext.test(f) && f !== 'artwork.json')
  .sort();

fs.writeFileSync(outputPath, JSON.stringify(files, null, 2) + '\n');
console.log('Generated artwork.json with', files.length, 'files');
