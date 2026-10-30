import {describe,it,expect} from 'vitest';
import {draftMediaLimit,validDraftImage} from '../src/lib/admin/media-validation';
const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64'));
describe('private draft upload validation',()=>{
 it('accepts a PNG binary and rejects spoofed MIME or empty files',()=>{
  expect(validDraftImage(png,'image/png')).toBe(true);
  expect(validDraftImage(png,'image/jpeg')).toBe(false);
  expect(validDraftImage(new TextEncoder().encode('<svg/>'),'image/png')).toBe(false);
  expect(validDraftImage(new Uint8Array(),'image/webp')).toBe(false);
 });
 it('rejects SVG and oversized multipart uploads',()=>{
  expect(validDraftImage(png,'image/svg+xml')).toBe(false);
  expect(validDraftImage(new Uint8Array(draftMediaLimit+1),'image/png')).toBe(false);
 });
});
