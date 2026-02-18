#!/usr/bin/env node
/**
 * Test clustering algorithm with existing data - v2
 * 改进：对大簇进行递归细分
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import natural from 'natural';
import nodejieba from 'nodejieba';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

const TfIdf = natural.TfIdf;

// 停用词
const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
  'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'not', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'also',
  'this', 'that', 'these', 'those', 'it', 'its', 'you', 'your', 'we',
  'they', 'their', 'he', 'she', 'him', 'her', 'his', 'who', 'whom',
  'which', 'what', 'where', 'when', 'why', 'how', 'all', 'each',
  'any', 'some', 'no', 'none', 'one', 'two', 'first', 'new', 'now',
  'about', 'get', 'make', 'like', 'use', 'using', 'more', 'most',
  'http', 'https', 'www', 'com', 'org', 'net', 'html', 'css', 'js',
  '的', '了', '和', '是', '就', '都', '而', '及', '与', '着', '或',
  '没有', '我们', '你们', '他们', '这个', '那个', '这些', '那些',
  '可以', '能够', '需要', '应该', '必须', '已经', '正在', '将要',
  '不是', '不能', '不会', '还是', '但是', '因为', '所以', '如果',
  '虽然', '然后', '或者', '以及', '通过', '进行', '使用', '支持',
  '包括', '以下', '以上', '之间', '之后', '之前', '其中', '对于',
  '等等', '比如', '例如', '即', '更', '最', '很', '非常', '真的',
  '一个', '这样', '那样', '什么', '怎么', '为什么', '如何'
]);

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
  '#14b8a6', '#f97316', '#ef4444', '#3b82f6', '#84cc16'
];

// 主题名称映射（让名称更语义化）
const NAME_MAP = {
  'ai': 'AI',
  'agent': 'Agent',
  'moltbook': 'Moltbot',
  'openclaw': 'OpenClaw',
  'browser': '浏览器',
  'tool': '工具',
  'code': '代码',
  'coding': '编程',
  'vibe': 'Vibe',
  'product': '产品',
  'app': '应用',
  'article': '文章',
  'twitter': 'Twitter',
  'github': 'GitHub'
};

function tokenize(text) {
  if (!text) return [];
  const tokens = [];
  
  const englishWords = text.match(/[a-zA-Z]+/g) || [];
  tokens.push(...englishWords.map(w => w.toLowerCase()));
  
  const chineseText = text.replace(/[a-zA-Z0-9\s\-_.,!?@#$%^&*()[\]{}|\\/<>:;"'`~]+/g, ' ');
  if (chineseText.trim()) {
    const chineseTokens = nodejieba.cut(chineseText, true);
    tokens.push(...chineseTokens.filter(t => t.trim().length > 1));
  }
  
  return tokens.filter(t => 
    t.length > 1 && 
    !STOPWORDS.has(t.toLowerCase()) &&
    !/^\d+$/.test(t)
  );
}

function getDocumentText(item) {
  return [
    item.title || '',
    item.note || '',
    (item.tags || []).join(' '),
    item.excerpt || ''
  ].join(' ');
}

function cosineSimilarity(vec1, vec2) {
  const keys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  let dot = 0, n1 = 0, n2 = 0;
  for (const k of keys) {
    const v1 = vec1[k] || 0, v2 = vec2[k] || 0;
    dot += v1 * v2;
    n1 += v1 * v1;
    n2 += v2 * v2;
  }
  return (n1 && n2) ? dot / (Math.sqrt(n1) * Math.sqrt(n2)) : 0;
}

function buildTfIdfVectors(items) {
  const tfidf = new TfIdf();
  items.forEach(item => {
    tfidf.addDocument(tokenize(getDocumentText(item)));
  });
  
  const vectors = items.map((_, idx) => {
    const vec = {};
    tfidf.listTerms(idx).forEach(t => {
      if (t.tfidf > 0.1) vec[t.term] = t.tfidf;
    });
    return vec;
  });
  
  return { tfidf, vectors };
}

/**
 * 层次聚类 - 支持递归细分大簇
 */
function hierarchicalClustering(itemIndices, vectors, threshold = 0.2) {
  if (itemIndices.length <= 1) {
    return itemIndices.map(idx => ({ items: [idx], depth: 0 }));
  }
  
  let clusters = itemIndices.map(idx => ({
    items: [idx],
    vector: vectors[idx],
    depth: 0
  }));
  
  while (clusters.length > 1) {
    let maxSim = 0, best = null;
    
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        let sim = 0, cnt = 0;
        for (const a of clusters[i].items) {
          for (const b of clusters[j].items) {
            sim += cosineSimilarity(vectors[a], vectors[b]);
            cnt++;
          }
        }
        sim = cnt ? sim / cnt : 0;
        if (sim > maxSim) { maxSim = sim; best = [i, j]; }
      }
    }
    
    if (maxSim < threshold || !best) break;
    
    const [i, j] = best;
    const merged = { ...clusters[i].vector };
    for (const [k, v] of Object.entries(clusters[j].vector)) {
      merged[k] = (merged[k] || 0) + v;
    }
    const total = clusters[i].items.length + clusters[j].items.length;
    for (const k of Object.keys(merged)) merged[k] /= total;
    
    const newCluster = {
      items: [...clusters[i].items, ...clusters[j].items],
      vector: merged,
      children: [clusters[i], clusters[j]],
      depth: Math.max(clusters[i].depth, clusters[j].depth) + 1
    };
    
    clusters = clusters.filter((_, idx) => idx !== i && idx !== j);
    clusters.push(newCluster);
  }
  
  return clusters;
}

/**
 * 对大簇进行递归细分
 */
function subdivideCluster(cluster, items, vectors, maxSize = 6, threshold = 0.25, depth = 0) {
  if (cluster.items.length <= maxSize || depth > 2) {
    return cluster;
  }
  
  // 先尝试按 tag 分组
  const tagGroups = groupByTags(cluster.items, items);
  if (tagGroups.length > 1 && tagGroups.every(g => g.length <= maxSize * 2)) {
    return {
      ...cluster,
      children: tagGroups.map(g => ({
        items: g,
        groupedBy: 'tag',
        depth: depth + 1
      }))
    };
  }
  
  // 用更高的阈值重新聚类
  const subClusters = hierarchicalClustering(cluster.items, vectors, threshold);
  
  if (subClusters.length <= 1) {
    if (threshold < 0.45) {
      return subdivideCluster(cluster, items, vectors, maxSize, threshold + 0.08, depth);
    }
    // 无法细分，按 domain 分组
    const domainGroups = groupByDomain(cluster.items, items);
    if (domainGroups.length > 1) {
      return {
        ...cluster,
        children: domainGroups.map(g => ({
          items: g,
          groupedBy: 'domain',
          depth: depth + 1
        }))
      };
    }
    return cluster;
  }
  
  return {
    ...cluster,
    children: subClusters.map(c => subdivideCluster(c, items, vectors, maxSize, threshold, depth + 1))
  };
}

/**
 * 按 tag 分组
 */
function groupByTags(indices, items) {
  const tagMap = {};
  indices.forEach(idx => {
    const tags = items[idx].tags || [];
    const mainTag = tags[0] || 'other';
    if (!tagMap[mainTag]) tagMap[mainTag] = [];
    tagMap[mainTag].push(idx);
  });
  return Object.values(tagMap).filter(g => g.length > 0);
}

/**
 * 按 domain 分组
 */
function groupByDomain(indices, items) {
  const domainMap = {};
  indices.forEach(idx => {
    const domain = items[idx].domain || 'other';
    // 简化 domain
    const key = domain.replace(/^www\./, '').split('.')[0];
    if (!domainMap[key]) domainMap[key] = [];
    domainMap[key].push(idx);
  });
  return Object.values(domainMap).filter(g => g.length > 0);
}

function prettifyName(term) {
  const lower = term.toLowerCase();
  if (NAME_MAP[lower]) return NAME_MAP[lower];
  return term.charAt(0).toUpperCase() + term.slice(1);
}

function generateClusterName(cluster, items, tfidf, usedNames = new Set()) {
  // 如果是按 tag 分组的，优先用 tag 名称
  if (cluster.groupedBy === 'tag') {
    const tagCounts = {};
    cluster.items.forEach(idx => {
      (items[idx].tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    if (topTag) {
      const name = prettifyName(topTag[0]);
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
    }
  }
  
  // 如果是按 domain 分组的，用 domain 名称
  if (cluster.groupedBy === 'domain') {
    const domains = {};
    cluster.items.forEach(idx => {
      const d = items[idx].domain?.replace(/^www\./, '').split('.')[0] || 'other';
      domains[d] = (domains[d] || 0) + 1;
    });
    const topDomain = Object.entries(domains).sort((a, b) => b[1] - a[1])[0];
    if (topDomain) {
      const name = prettifyName(topDomain[0]);
      if (!usedNames.has(name)) {
        usedNames.add(name);
        return name;
      }
    }
  }
  
  // 用 TF-IDF 关键词
  const scores = {};
  cluster.items.forEach(idx => {
    tfidf.listTerms(idx).slice(0, 15).forEach(t => {
      if (t.term.length > 1 && !STOPWORDS.has(t.term)) {
        scores[t.term] = (scores[t.term] || 0) + t.tfidf;
      }
    });
  });
  
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  for (let i = 0; i < Math.min(sorted.length, 5); i++) {
    const name1 = prettifyName(sorted[i][0]);
    if (!usedNames.has(name1)) {
      usedNames.add(name1);
      return name1;
    }
    for (let j = i + 1; j < Math.min(sorted.length, 6); j++) {
      const name2 = prettifyName(sorted[j][0]);
      const combo = `${name1} / ${name2}`;
      if (!usedNames.has(combo)) {
        usedNames.add(combo);
        return combo;
      }
    }
  }
  
  return `主题 ${usedNames.size + 1}`;
}

function buildThemeTree(clusters, items, tfidf, depth = 0, usedNames = new Set()) {
  return clusters.map((cluster, idx) => {
    const theme = {
      id: `theme-${depth}-${idx}-${Date.now().toString(36).slice(-4)}`,
      name: generateClusterName(cluster, items, tfidf, usedNames),
      color: COLORS[idx % COLORS.length],
      items: cluster.items.map(i => items[i]._id),
      depth
    };
    
    if (cluster.children && cluster.children.length > 1 && depth < 2) {
      theme.children = buildThemeTree(cluster.children, items, tfidf, depth + 1, usedNames);
    }
    
    return theme;
  });
}

// Main
console.log('Loading existing bookmarks...');
const data = JSON.parse(readFileSync(join(dataDir, 'bookmarks.json'), 'utf-8'));
const items = data.items;
console.log(`Loaded ${items.length} bookmarks`);

console.log('\nBuilding TF-IDF vectors...');
const { tfidf, vectors } = buildTfIdfVectors(items);

console.log('Running hierarchical clustering...');
const allIndices = items.map((_, i) => i);
let clusters = hierarchicalClustering(allIndices, vectors, 0.15);
console.log(`Initial: ${clusters.length} clusters`);

// 过滤小簇，合并成"其他"
const minSize = 2;
let valid = clusters.filter(c => c.items.length >= minSize);
const small = clusters.filter(c => c.items.length < minSize);

if (small.length > 0) {
  const otherCluster = {
    items: small.flatMap(c => c.items),
    depth: 0
  };
  valid.push(otherCluster);
}

// 细分所有大簇（包括"其他"）
console.log('Subdividing large clusters...');
valid = valid.map(c => subdivideCluster(c, items, vectors, 6, 0.20));

const themes = buildThemeTree(valid, items, tfidf);

// Assign themes to items
items.forEach(item => {
  item.themes = [];
  const addThemes = (themeList) => {
    themeList.forEach(theme => {
      if (theme.items.includes(item._id)) {
        item.themes.push(theme.id);
      }
      if (theme.children) addThemes(theme.children);
    });
  };
  addThemes(themes);
});

console.log('\n=== Generated Themes ===');
const printTheme = (t, indent = '') => {
  console.log(`${indent}📁 ${t.name} (${t.items.length} items)`);
  if (t.children) {
    t.children.forEach(c => printTheme(c, indent + '   '));
  }
};
themes.forEach(t => printTheme(t));
console.log('========================\n');

// Save
const output = {
  meta: { syncedAt: new Date().toISOString(), count: items.length },
  themes,
  items,
  relations: data.relations
};

writeFileSync(join(dataDir, 'bookmarks.json'), JSON.stringify(output, null, 2));
console.log('Saved to data/bookmarks.json');
