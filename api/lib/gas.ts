function getGasUrl() {
  const gasUrl = process.env.GAS_URL;
  if (!gasUrl) throw new Error('GAS_URL is not configured');
  return gasUrl;
}

export async function callGas(action: string, payload: Record<string, string | number | boolean | null | undefined> = {}) {
  const serverToken = process.env.GAS_SERVER_TOKEN;
  const url = new URL(getGasUrl());
  url.searchParams.set('action', action);
  if (serverToken) url.searchParams.set('serverToken', serverToken);

  for (const [key, value] of Object.entries(payload)) {
    url.searchParams.set(key, value == null ? '' : String(value));
  }

  const response = await fetch(url.toString(), {
    redirect: 'follow',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`GAS HTTP ${response.status}`);
  }

  const json = await response.json();
  if (json?.error) {
    throw new Error(String(json.error));
  }
  return json;
}
