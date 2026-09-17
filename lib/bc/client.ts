export class BcApiError extends Error {
  status: number;

  body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "BcApiError";
    this.status = status;
    this.body = body;
  }
}

export type BcClient = {
  storeHash: string;
  request: <T>(path: string, init?: RequestInit) => Promise<T>;
};

export function createBcClient(
  storeHash: string,
  accessToken: string,
): BcClient {
  const baseUrl = `https://api.bigcommerce.com/stores/${storeHash}`;

  return {
    storeHash,
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {
      const response = await fetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Auth-Token": accessToken,
          ...init.headers,
        },
        cache: "no-store",
      });

      const text = await response.text();
      if (!response.ok) {
        throw new BcApiError(
          `BigCommerce API ${response.status} for ${path}`,
          response.status,
          text.slice(0, 500),
        );
      }

      if (!text) {
        return undefined as T;
      }

      return JSON.parse(text) as T;
    },
  };
}
