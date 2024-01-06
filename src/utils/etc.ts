import { API } from 'megajs';
import { BasicError } from './types';

export function setApiSettings(gateway: string) {
  const globalApi = API.getGlobalApi();
  globalApi.userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  globalApi.keepalive = true;
  globalApi.gateway = gateway;
}

export function repairMegaURL(url: string) {
  if (
    !url.startsWith('https://mega.nz/#!') &&
    !url.startsWith('https://mega.nz/file/')
  ) {
    url = 'https://mega.nz/file/' + url;
  }
  return url;
}

export function examineFileSize(sizeInBytes: number) {
  if (sizeInBytes > 1024 * 1024 * 1024 * (process.env.MAX_FILE_SIZE ?? 20)) {
    return new BasicError({
      message: `File must be less than ${process.env.MAX_FILE_SIZE ?? 20}GB.`,
      statusCode: 400,
    });
  }
}
