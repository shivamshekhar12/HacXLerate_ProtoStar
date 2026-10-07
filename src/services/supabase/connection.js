// A read-only API/key check; it does not access student tables or establish a login.
export async function checkSupabaseConnection(config, fetcher = fetch) {
  if (!config.configured) return { connected: false, reason: 'not_configured' };
  try {
    const response = await fetcher(`${config.url}/auth/v1/settings`, {
      headers: { apikey: config.key },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return { connected: false, reason: response.status === 401 || response.status === 403 ? 'key_rejected' : 'unavailable', status: response.status };
    const settings = await response.json();
    if (!settings || typeof settings.external !== 'object' || settings.external === null) return { connected: false, reason: 'unexpected_response' };
    return { connected: true, status: response.status };
  } catch { return { connected: false, reason: 'network_error' }; }
}
