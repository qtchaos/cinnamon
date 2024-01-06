import { SimpleMegaFile, prepareFile } from '../../utils/download';
import { examineFileSize, setApiSettings } from '../../utils/etc';
import { createSequentialReadableStream } from '../../utils/streams';
import { BasicError, Query } from '../../utils/types';
import { config } from 'dotenv';

export default defineEventHandler(async (event) => {
  /*
    /multistream
      ?destination=[FILE_URL,FILE_URL...]
      &gateway=eu
      &download=true

    The files are streamed in the order they are provided.
    The destinations must include the decrypt key, since this is different for each file.
    If the gateway is not provided, the default gateway will be used. (global)
    If download is true, the streamed file will be downloaded as an attachment.
  */

  config();

  let query: Query;

  try {
    query = new Query(getQuery(event));
  } catch (error) {
    event.node.res.statusCode = error.statusCode || 400;
    return { error: error.message };
  }

  let destinations: string[] = query.getDestinationArray();
  if (destinations.length > 10) {
    event.node.res.statusCode = 400;
    return { error: 'Too many files.' };
  }

  setApiSettings(query.getGateway());

  let files: SimpleMegaFile[] = [];
  for (let destination of destinations) {
    let res = await prepareFile(destination);
    if (res instanceof BasicError) {
      event.node.res.statusCode = res.statusCode;
      return { error: res.message };
    }
    files.push(res);
  }

  let contentLength = 0;
  files.forEach((file) => (contentLength += file.sizeInBytes));

  const fileSizeError = examineFileSize(contentLength);
  if (fileSizeError) {
    event.node.res.statusCode = fileSizeError.statusCode;
    return { error: fileSizeError.message };
  }

  setResponseHeader(event, 'Content-Type', files[0].mime);
  setResponseHeader(event, 'Content-Length', contentLength);
  setResponseHeader(
    event,
    'Content-Range',
    `bytes 0-${contentLength}/${contentLength}`,
  );
  if (query.download) {
    setResponseHeader(
      event,
      'Content-Disposition',
      `attachment; filename="${files[0].name}"`,
    );
  } else {
    setResponseHeader(event, 'Content-Disposition', `inline`);
  }

  const rawFiles = files.map((file) => file.file);

  return createSequentialReadableStream(rawFiles);
});
