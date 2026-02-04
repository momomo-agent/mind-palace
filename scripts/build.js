#!/usr/bin/env node
/**
 * Build static site from bookmark data
 */
import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const distDir = join(__dirname, '..', 'dist');

function build() {
  console.log('Building mind palace...');
  
  const data = JSON.parse(readFileSync(join(dataDir, 'bookmarks.json'), 'utf-8'));
  
  // Embed data into HTML
  const html = readFileSync(join(__dirname, '..', 'src', 'index.html'), 'utf-8');
  const output = html.replace('__DATA__', JSON.stringify(data));
  
  writeFileSync(join(distDir, 'index.html'), output);
  console.log('Built dist/index.html');
}

build();
