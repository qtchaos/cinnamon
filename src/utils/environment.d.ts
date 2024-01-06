declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MAX_CHUNK_SIZE: number;
      CHUNK_SIZE_INCREMENT: number;
      MAX_FILE_SIZE: number;
      PREVIEW_KEY: string;
    }
  }
}

export {};
