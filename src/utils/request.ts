interface RequestParams {
  [key: string]: string | number | boolean | undefined;
}

function buildQueryString(params: RequestParams): string {
  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return queryParams ? `?${queryParams}` : '';
}

export async function get(url: string, params: RequestParams = {}): Promise<any> {
  try {
    const queryString = buildQueryString(params);
    const response = await fetch(`${url}${queryString}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
}

export async function post(url: string, data: any = {}): Promise<any> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
} 