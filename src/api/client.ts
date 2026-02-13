export interface FetchOptions {
  delayMs?: number;
  errorRate?: number;
}

export async function simulateFetch<T>(
  data: T,
  options: FetchOptions = {}
): Promise<T> {
  const { delayMs = 300, errorRate = 0 } = options;

  await new Promise((resolve) => setTimeout(resolve, delayMs));

  if (errorRate > 0 && Math.random() < errorRate) {
    throw new Error('Simulated API error');
  }

  return data;
}

