// Request deduplication utility to prevent duplicate API calls
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Fetch with request deduplication - if the same URL is requested
 * while a previous request is pending, it will return the same promise
 */
export async function dedupedFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const key = `${url}${JSON.stringify(options || {})}`;

  // If there's a pending request for the same URL, return it
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // Create new request
  const requestPromise = fetch(url, {
    ...options,
    // Add cache headers for GET requests
    cache: options?.method === undefined || options?.method === 'GET' 
      ? 'default' 
      : 'no-store',
  })
    .then(async (response) => {
      // Remove from pending after completion
      pendingRequests.delete(key);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    })
    .catch((error) => {
      // Remove from pending on error
      pendingRequests.delete(key);
      throw error;
    });

  // Store pending request
  pendingRequests.set(key, requestPromise);

  return requestPromise;
}

