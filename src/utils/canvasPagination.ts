/**
 * Canvas API Pagination Utilities
 * 
 * Canvas uses Link headers for pagination following RFC 5988
 * Example: Link: <https://q.utoronto.ca/api/v1/courses?page=2>; rel="next"
 */

export interface PaginationLinks {
  current?: string;
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
}

/**
 * Parses Link header from Canvas API response
 * @param linkHeader - The Link header string from response
 * @returns Object with pagination links
 */
export function parseLinkHeader(linkHeader: string | null): PaginationLinks {
  const links: PaginationLinks = {};

  if (!linkHeader) {
    return links;
  }

  // Split by comma to get individual links
  const linkParts = linkHeader.split(',');

  for (const part of linkParts) {
    // Match: <URL>; rel="relation"
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const url = match[1];
      const rel = match[2];
      links[rel as keyof PaginationLinks] = url;
    }
  }

  return links;
}

/**
 * Fetches all pages of a paginated Canvas API endpoint
 * @param fetchPage - Function that fetches a single page given a URL
 * @param firstPageUrl - URL for the first page
 * @param maxPages - Maximum number of pages to fetch (safety limit, default 100)
 * @returns Array of all items from all pages
 */
export async function fetchAllPages<T>(
  fetchPage: (url: string) => Promise<Response>,
  firstPageUrl: string,
  maxPages: number = 100
): Promise<T[]> {
  const allItems: T[] = [];
  let currentUrl: string | undefined = firstPageUrl;
  let pageCount = 0;

  while (currentUrl && pageCount < maxPages) {
    const response = await fetchPage(currentUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const data: T[] = await response.json();
    allItems.push(...data);

    // Check for next page in Link header
    const linkHeader = response.headers.get('Link');
    const links = parseLinkHeader(linkHeader);

    if (links.next) {
      currentUrl = links.next;
      pageCount++;
    } else {
      // No more pages
      break;
    }
  }

  if (pageCount >= maxPages) {
    console.warn(`Reached maximum page limit (${maxPages}). There may be more data.`);
  }

  return allItems;
}

/**
 * Extracts page number from a Canvas API URL
 * @param url - Canvas API URL with page parameter
 * @returns Page number or null if not found
 */
export function getPageFromUrl(url: string): number | null {
  const match = url.match(/[?&]page=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
