// Keep multipart bodies below the default 1 MiB Server Action limit.
export const draftMediaLimit = 768 * 1024;
export function validDraftImage(bytes: Uint8Array, mime: string) {
  if (!bytes.length || bytes.length > draftMediaLimit) return false;
  if (mime === 'image/png') return bytes.length >= 24 && [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
  if (mime === 'image/jpeg') return bytes.length >= 4 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
  if (mime === 'image/webp') return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  return false;
}
