import path from 'path';
import fs from 'fs';

export const findClosetFile = (start: string, fileName: string) => {
  let dir = start;

  while (true) {
    const targetPath = path.join(dir, fileName);

    if (fs.existsSync(targetPath)) {
      return path.dirname(targetPath);
    }

    const parentDir = path.resolve(dir, '..');

    if (parentDir === dir) {
      throw new Error(`'${fileName}' not found upward from ${start}`);
    }

    dir = parentDir;
  }
};
