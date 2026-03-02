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
  
  // Sort items by created date descending (newest first)
  if (data.items) {
    data.items.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
  }
  
  // Embed data into HTML
  const html = readFileSync(join(__dirname, '..', 'src', 'index.html'), 'utf-8');
  const output = html.replace('__DATA__', JSON.stringify(data));
  
  writeFileSync(join(distDir, 'index.html'), output);
  copyFileSync(join(__dirname, '..', 'src', 'favicon.svg'), join(distDir, 'favicon.svg'));
  console.log('Built dist/index.html');
}

build();
