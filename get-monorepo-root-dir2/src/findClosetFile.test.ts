import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { findClosetFile } from './findClosetFile';

let tempRoot: string;
let level1: string;
let level2: string;

beforeAll(() => {
  tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'find-closet-file-'));
  level1 = path.join(tempRoot, 'level1');
  level2 = path.join(level1, 'level2');
  fs.mkdirSync(level2, { recursive: true });
});

afterAll(() => {
  if (fs.existsSync(tempRoot)) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

describe('findClosetFile', () => {
  it('조상 경로에서 파일을 찾아 해당 디렉터리 경로를 반환한다', () => {
    const fileName = 'target-a.txt';
    const targetAtRoot = path.join(tempRoot, fileName);
    fs.writeFileSync(targetAtRoot, 'a');

    const result = findClosetFile(level2, fileName);

    expect(result).toBe(tempRoot);
    expect(path.isAbsolute(result)).toBe(true);

    fs.unlinkSync(targetAtRoot);
  });

  it('가장 가까운(현재) 디렉터리에 파일이 있으면 그 디렉터리를 반환한다', () => {
    const fileName = 'target-b.txt';
    const targetAtCurrent = path.join(level2, fileName);
    fs.writeFileSync(targetAtCurrent, 'b');

    const result = findClosetFile(level2, fileName);

    expect(result).toBe(level2);

    fs.unlinkSync(targetAtCurrent);
  });

  it('가장 가까운 조상 디렉터리에 있는 파일을 우선적으로 찾는다', () => {
    const fileName = 'target-c.txt';
    const targetAtLevel1 = path.join(level1, fileName);
    fs.writeFileSync(targetAtLevel1, 'c');

    const result = findClosetFile(level2, fileName);

    expect(result).toBe(level1);

    fs.unlinkSync(targetAtLevel1);
  });

  it('파일이 존재하지 않으면 에러를 발생시킨다', () => {
    const fileName = 'not-exist.txt';
    const startPath = level2;

    expect(() => findClosetFile(startPath, fileName)).toThrow(
      `'${fileName}' not found upward from ${startPath}`,
    );
  });
});
