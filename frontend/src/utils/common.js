import { pinyin } from 'pinyin-pro';

export function getName1stLetter(name) {
  if (!name) {
    return '';
  }
  return pinyin(name, { toneType: 'none', type: 'array' })
    .map(item => item.charAt(0).toUpperCase())
    .reduce((prev, next) => `${prev}${next}`);
}
