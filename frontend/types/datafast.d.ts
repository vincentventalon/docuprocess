interface DatafastIdentifyParams {
  user_id: string;
  name?: string;
  image?: string;
  [key: string]: string | undefined;
}

interface DatafastFunction {
  (command: "identify", params: DatafastIdentifyParams): void;
  (command: string, ...args: unknown[]): void;
  q?: unknown[];
}

declare global {
  interface Window {
    datafast?: DatafastFunction;
  }
}

export {};
