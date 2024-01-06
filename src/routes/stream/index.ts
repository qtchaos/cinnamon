import { config } from 'dotenv';
import { prepareFile } from '../../utils/download';
import { examineFileSize, setApiSettings } from '../../utils/etc';
import { createReturnableStream } from '../../utils/streams';
import { Query, BasicError } from '../../utils/types';

export default defineEventHandler(async (event) => {
  /*
    /stream
      ?destination=FILE_URL
      &gateway=eu
      &key=DECRYPT_KEY
      &download=true

    If the decrypt key is not provided, the destination URL must include it.
    If the gateway is not provided, the default gateway will be used. (global).
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

  setApiSettings(query.getGateway());

  let res = await prepareFile(query.getDestination());
  if (res instanceof BasicError) {
    event.node.res.statusCode = res.statusCode;
    return { error: res.message };
  }

  const fileSizeError = examineFileSize(res.sizeInBytes);
  if (fileSizeError) {
    event.node.res.statusCode = fileSizeError.statusCode;
    return { error: fileSizeError.message };
  }

  setResponseHeader(event, 'Content-Type', res.mime);
  setResponseHeader(event, 'Content-Length', res.sizeInBytes);
  if (query.download) {
    setResponseHeader(
      event,
      'Content-Disposition',
      `attachment; filename="${res.name}"`,
    );
  } else {
    setResponseHeader(event, 'Content-Disposition', `inline`);
  }

  return createReturnableStream(res.file);
});
