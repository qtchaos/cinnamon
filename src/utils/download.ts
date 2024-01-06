import { File } from 'megajs';
import { getMimeType } from './attributes';
import { BasicError } from './types';

export type SimpleMegaFile = {
  name: string;
  file: File;
  mime: string;
  sizeInBytes: number;
};

export async function prepareFile(
  destination: string,
): Promise<BasicError | SimpleMegaFile> {
  const file = File.fromURL(destination);
  let attributes: File;
  if (!file)
    return new BasicError({
      message: 'Invalid URL.',
      statusCode: 400,
    });
  try {
    attributes = await file.loadAttributes();
  } catch (error) {
    return new BasicError({ message: error.message, statusCode: 404 });
  }

  return {
    name: attributes.name,
    file: file,
    mime: getMimeType(attributes.name),
    sizeInBytes: attributes.size,
  };
}
