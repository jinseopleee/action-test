import path from 'path';
import { fileURLToPath } from 'url';
import { findClosetFile } from './findClosetFile';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const getMonorepoRootPath = () => {
  const root = 'core-partner-frontend';

  return findClosetFile(__dirname, 'pnpm-workspace.yaml');
}
