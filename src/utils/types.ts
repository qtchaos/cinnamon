import { repairMegaURL } from './etc';

const gateways = {
  eu: 'https://eu.api.mega.co.nz/',
  global: 'https://g.api.mega.co.nz/',
};

export class Query {
  destination: string | string[];
  gateway?: string;
  key?: string;
  download?: boolean;

  constructor(query: {
    destination: string;
    gateway?: string;
    key?: string;
    download?: boolean;
    preview_key?: string;
  }) {
    if (!query.destination) {
      throw new BasicError({
        message: 'Missing destination.',
        statusCode: 400,
      });
    }

    if (process.env.PREVIEW_KEY) {
      if (query.preview_key !== process.env.PREVIEW_KEY) {
        throw new BasicError({
          message: 'Unauthorized.',
          statusCode: 401,
        });
      }
    }

    this.download = query.download;
    this.destination = query.destination;
    this.key = query.key;

    if (query.destination.startsWith('[')) {
      if (query.destination.includes(',')) {
        this.destination = query.destination.slice(1, -1).split(',');
      } else {
        this.destination = [query.destination.slice(1, -1)];
      }
    }

    if (this.destination instanceof Array) {
      this.destination = this.destination.map((destination) => {
        return repairMegaURL(destination);
      });
    } else {
      this.destination = repairMegaURL(this.destination);
      if (query.key) {
        this.destination = this.destination + '#' + query.key;
      }
    }

    if (query.gateway) {
      if (!gateways[query.gateway]) {
        this.gateway = gateways['global'];
      }
      this.gateway = gateways[query.gateway];
    } else {
      this.gateway = gateways['global'];
    }
  }
  getDestination(): string {
    return this.destination.toString();
  }
  getDestinationArray(): string[] {
    return Array.isArray(this.destination) ? this.destination : [];
  }
  getGateway(): string | undefined {
    return this.gateway;
  }
  getKey(): string | undefined {
    return this.key;
  }
}

export class BasicError {
  message: string;
  statusCode: number;

  constructor(errorDetails: { message: string; statusCode: number }) {
    this.message = errorDetails.message;
    this.statusCode = errorDetails.statusCode;
  }
}
