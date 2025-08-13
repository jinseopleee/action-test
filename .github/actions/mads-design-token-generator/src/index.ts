import * as core from '@actions/core';
import axios from 'axios';
import type { GetFileStylesResponse, GetFileNodesResponse } from '@figma/rest-api-spec';
import fs from 'node:fs';
import { rgbaToCss } from './rgbaToCss';
import { toKebab } from './toKebab';
import type { CssVar } from './types';
import { hasFills } from './hasFills';
import { isTextDocument } from './isTextDocument';
import { findClosetFile } from './findClosetFile';

(async () => {
  const FIGMA_ACCESS_TOKEN = core.getInput('FIGMA_ACCESS_TOKEN', { required: true });

  console.log(`⌛️ figma styles data 조회`);
  const stylesRes = await axios.get<GetFileStylesResponse>(
    'https://api.figma.com/v1/files/lAbzqUQAovN15n5n6g6Zxl/styles',
    {
      headers: {
        'X-Figma-Token': `${FIGMA_ACCESS_TOKEN}`,
      },
    },
  );

  const { styles } = stylesRes.data.meta;

  const allNodeIds = styles.map((s) => s.node_id);
  console.log(`⌛️ => 조회된 styles data node id 개수 : ${allNodeIds.length}`);

  console.log(`⌛️ figma node data 조회`);
  const nodesRes = await axios.get<GetFileNodesResponse>(
    'https://api.figma.com/v1/files/lAbzqUQAovN15n5n6g6Zxl/nodes',
    {
      headers: {
        'X-Figma-Token': `${FIGMA_ACCESS_TOKEN}`,
      },
      params: {
        ids: allNodeIds.join(','),
      },
    },
  );
  const { nodes } = nodesRes.data;
  console.log(`⌛️ => 조회된 node 개수 : ${Object.entries(nodes).length}`);

  const cssVars: CssVar[] = [];

  console.log(`⌛️ 토큰 생성`);

  styles.forEach((style) => {
    const { document } = nodes[style.node_id];

    if (!document) {
      return;
    }

    const path = style.name
      .replace(/\([^)]*\)/g, '')
      .split('/')
      .map(toKebab);

    // Color
    if (style.style_type === 'FILL') {
      if (hasFills(document)) {
        const fill = document.fills[0];

        if (fill.type === 'SOLID') {
          const css = rgbaToCss({
            r: fill.color.r,
            g: fill.color.g,
            b: fill.color.b,
            a: fill.opacity ? fill.opacity : fill.color.a,
          });

          cssVars.push({
            namespace: 'color',
            key: `${path.join('-')}`,
            value: css,
          });
        }
      }
    }

    // Text
    if (style.style_type === 'TEXT') {
      if (isTextDocument(document)) {
        Object.entries(document.style).forEach(([key, value]) => {
          if (value === null) {
            return;
          }

          if (typeof value === 'object') {
            return;
          }

          if (key.includes('fontFamily')) {
            cssVars.push({
              namespace: 'font',
              key: `${path.join('-')}`,
              value,
            });
          } else if (key.includes('fontWeight')) {
            cssVars.push({
              namespace: 'font-weight',
              key: `${path.join('-')}`,
              value,
            });
          } else if (key.includes('fontSize')) {
            cssVars.push({
              namespace: 'text',
              key: `${path.join('-')}`,
              value: `${value}px`,
            });
          } else if (key.includes('lineHeightPx')) {
            cssVars.push({
              namespace: 'leading',
              key: `${path.join('-')}`,
              value: `${value}px`,
            });
          } else if (key.includes('letterSpacing')) {
            cssVars.push({
              namespace: 'tracking',
              key: `${path.join('-')}`,
              value: `${value}px`,
            });
          }
        });
      }
    }

    // Effect
    if (style.style_type === 'EFFECT') {
      // Effect
    }

    // Layout Guide
    if (style.style_type === 'GRID') {
      // Grid
    }
  });

  console.log(`⌛️ => 생성된 토큰 개수 : ${cssVars.length}`);

  // css파일 생성
  const lines: string[] = ['@theme {'];

  cssVars.forEach((cssVar) => {
    if (cssVar.namespace === 'custom') {
      lines.push(`  --${cssVar.key}: ${cssVar.value};`);
    } else {
      lines.push(`  --${cssVar.namespace}-${cssVar.key}: ${cssVar.value};`);
    }
  });

  lines.push('}');

  const themeCss = lines.join('\n');

  const root = findClosetFile(process.cwd(), 'pnpm-workspace.yaml');
  const themeDir = `${root}/packages/mads/src/foundation/theme.css`;
  fs.writeFileSync(themeDir, themeCss);

  console.log(`🚀 토큰이 ${themeDir}에 생성되었습니다.`);
})();
