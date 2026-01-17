/**
 * Debug utility for Canvas API issues
 */

export function debugCanvasRequest(url: string, apiKey: string) {
  console.group('🔍 Canvas API Debug');
  console.log('URL:', url);
  console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
  console.log('API Key length:', apiKey.length);
  
  return fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    credentials: 'omit',
  })
    .then(async (response) => {
      console.log('Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response Data:', data);
      return data;
    })
    .catch((error) => {
      console.error('Fetch Error:', error);
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('❌ This is likely a CORS error.');
        console.error('Canvas API may not allow direct browser requests.');
        console.error('Solution: Use a backend/proxy server for Canvas API calls.');
      }
      
      throw error;
    })
    .finally(() => {
      console.groupEnd();
    });
}
