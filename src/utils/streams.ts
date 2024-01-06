import { File } from 'megajs';

export function createReturnableStream(file: File): ReadableStream {
  const stream = file.download({
    maxChunkSize: 1024 * 1024 * (process.env.MAX_CHUNK_SIZE ?? 5),
    chunkSizeIncrement: 1024 * 1024 * (process.env.CHUNK_SIZE_INCREMENT ?? 1.5),
  });
  stream.on('error', (error) => {
    return new Error(error.message);
  });

  const output = new ReadableStream({
    async start(controller) {
      stream.on('data', (chunk) => {
        controller.enqueue(chunk);
      });
    },
    cancel() {
      stream.destroy();
    },
  });

  return output;
}

export function createSequentialReadableStream(files: File[]): ReadableStream {
  let currentStreamIndex = 0;
  let currentStreamController: ReadableStreamDefaultController | null = null;
  let streams = [];

  const startNextStream = () => {
    if (currentStreamIndex >= files.length) {
      // No more streams to start
      currentStreamController?.close();
      return;
    }

    streams.push(
      files[currentStreamIndex].download({
        maxChunkSize: 1024 * 1024 * (process.env.MAX_CHUNK_SIZE ?? 5),
        chunkSizeIncrement:
          1024 * 1024 * (process.env.CHUNK_SIZE_INCREMENT ?? 1.5),
      }),
    );
    const currentStream = streams[currentStreamIndex];

    currentStream.on('error', (error: { message: string }) => {
      return new Error(error.message);
    });

    currentStream.on('data', (chunk: Uint8Array) => {
      // Push the chunk from the current stream to the controller
      currentStreamController?.enqueue(chunk);
    });

    currentStream.on('end', () => {
      // Current stream has ended, move to the next stream
      currentStreamIndex++;
      startNextStream();
    });
  };

  return new ReadableStream({
    async start(controller) {
      currentStreamController = controller;
      startNextStream();
    },
    cancel() {
      streams.forEach((stream) => stream.destroy());
    },
  });
}
