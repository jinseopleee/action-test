export const toKebab = (input: string): string => {
  let s = input.trim();

  // 1) 공백/언더스코어 -> 하이픈
  s = s.replace(/[\s_]+/g, '-');

  // 2) 연속 대문자(2글자 이상)는 글자 사이에 하이픈 삽입 (e.g., ABC -> A-B-C)
  s = s.replace(/[A-Z]{2,}/g, (m) => m.split('').join('-'));

  // 3) 이전 문자가 하이픈이 아닌 경우에만 대문자 앞에 하이픈 삽입
  //    (연속 대문자 처리 이후라 이 로직으로도 이중 하이픈이 생기지 않음)
  s = s.replace(/([^-\n])([A-Z])/g, '$1-$2');

  // 4) 모두 소문자
  s = s.toLowerCase();

  // 5) 중복 하이픈 정리 & 양끝 하이픈 제거
  s = s.replace(/-+/g, '-').replace(/^-+|-+$/g, '');

  return s;
};
