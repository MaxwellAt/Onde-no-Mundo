const DEFAULT_API_BASE = 'https://restcountries.com/v2';
const CACHE_KEY = 'ondeNoMundo:countriesCache:v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let inMemoryCache = null;
let inFlightPromise = null;

function nowMs() {
  return Date.now();
}

function readLocalStorageCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!Array.isArray(parsed.data)) return null;
    if (typeof parsed.savedAt !== 'number') return null;
    if (nowMs() - parsed.savedAt > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeLocalStorageCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ savedAt: nowMs(), data })
    );
  } catch {
    // ignore quota / private mode
  }
}

async function fetchJson(url, { timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} ao buscar ${url}`);
    }
    return await resp.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeLanguages(raw) {
  if (!raw) return [];

  // v2: [{ name: 'Pashto', ... }]
  if (Array.isArray(raw)) {
    return raw
      .map((lang) => (lang && typeof lang.name === 'string' ? lang.name : null))
      .filter(Boolean);
  }

  // v3: { eng: 'English', por: 'Portuguese' }
  if (typeof raw === 'object') {
    return Object.values(raw)
      .filter((v) => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeCurrenciesCode(raw) {
  if (!raw) return '';

  // v2: [{ code: 'AFN', ... }]
  if (Array.isArray(raw)) {
    const code = raw.find((c) => c && typeof c.code === 'string')?.code;
    return typeof code === 'string' ? code : '';
  }

  // v3: { USD: { name: 'United States dollar', symbol: '$' } }
  if (typeof raw === 'object') {
    const keys = Object.keys(raw);
    return typeof keys[0] === 'string' ? keys[0] : '';
  }

  return '';
}

function normalizeNativeName(raw) {
  if (!raw) return '';

  // v2: nativeName: '...'
  if (typeof raw.nativeName === 'string') return raw.nativeName;

  // v3: name.nativeName is an object with different language keys
  const nn = raw.name?.nativeName;
  if (nn && typeof nn === 'object') {
    const first = Object.values(nn)[0];
    if (first && typeof first.common === 'string') return first.common;
    if (first && typeof first.official === 'string') return first.official;
  }

  return '';
}

function normalizeName(raw) {
  if (!raw) return '';
  if (typeof raw.name === 'string') return raw.name;
  if (raw.name && typeof raw.name.common === 'string') return raw.name.common;
  if (raw.name && typeof raw.name.official === 'string') return raw.name.official;
  return '';
}

function normalizeFlags(raw) {
  // v2: flags: { png, svg }, plus legacy: flag: '...'
  const png = raw?.flags?.png;
  const svg = raw?.flags?.svg;
  const legacy = raw?.flag;

  return {
    png: typeof png === 'string' ? png : typeof legacy === 'string' ? legacy : '',
    svg: typeof svg === 'string' ? svg : typeof legacy === 'string' ? legacy : '',
  };
}

export function normalizeCountry(raw) {
  const name = normalizeName(raw);
  const alpha3Code =
    (typeof raw?.alpha3Code === 'string' && raw.alpha3Code) ||
    (typeof raw?.cca3 === 'string' && raw.cca3) ||
    '';

  const region =
    (typeof raw?.region === 'string' && raw.region) ||
    (Array.isArray(raw?.continents) && typeof raw.continents[0] === 'string'
      ? raw.continents[0]
      : '');

  const capital =
    (typeof raw?.capital === 'string' && raw.capital) ||
    (Array.isArray(raw?.capital) && typeof raw.capital[0] === 'string'
      ? raw.capital[0]
      : '');

  const population = toNumber(raw?.population);
  const topLevelDomain =
    (Array.isArray(raw?.topLevelDomain) && raw.topLevelDomain.filter(Boolean)) ||
    (Array.isArray(raw?.tld) && raw.tld.filter(Boolean)) ||
    [];

  const languages = normalizeLanguages(raw?.languages);
  const currenciesCode = normalizeCurrenciesCode(raw?.currencies);
  const nativeName = normalizeNativeName(raw);
  const borders = Array.isArray(raw?.borders) ? raw.borders.filter(Boolean) : [];
  const flags = normalizeFlags(raw);

  return {
    name,
    alpha3Code,
    nativeName,
    region,
    capital,
    population,
    topLevelDomain,
    currenciesCode,
    languages,
    borders,
    flags,
  };
}

export function normalizeCountries(rawArray) {
  if (!Array.isArray(rawArray)) return [];

  const normalized = rawArray
    .map(normalizeCountry)
    .filter((c) => c && typeof c.name === 'string' && c.name.trim().length > 0);

  const seen = new Set();
  const deduped = [];
  for (const c of normalized) {
    const key = c.alpha3Code || c.name;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(c);
  }

  deduped.sort((a, b) => a.name.localeCompare(b.name));
  return deduped;
}

export async function loadCountries({ preferCache = true } = {}) {
  if (inMemoryCache) return inMemoryCache;
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = (async () => {
    const cached = preferCache ? readLocalStorageCache() : null;
    if (cached) {
      const normalizedCached = normalizeCountries(cached);
      inMemoryCache = normalizedCached;
      return normalizedCached;
    }

    const apiBase =
      (typeof process !== 'undefined' &&
        process.env &&
        process.env.REACT_APP_COUNTRIES_API_BASE) ||
      DEFAULT_API_BASE;

    const apiUrl =
      `${apiBase}/all?fields=` +
      [
        'name',
        'nativeName',
        'alpha3Code',
        'region',
        'capital',
        'population',
        'topLevelDomain',
        'currencies',
        'languages',
        'borders',
        'flags',
        'flag',
      ].join(',');

    try {
      const apiData = await fetchJson(apiUrl);
      const normalized = normalizeCountries(apiData);
      inMemoryCache = normalized;
      writeLocalStorageCache(apiData);
      return normalized;
    } catch (e) {
      // Fallback para dataset local (modo offline / GitHub Pages)
      const localUrl = `${process.env.PUBLIC_URL || ''}/data.json`;
      const localData = await fetchJson(localUrl);
      const normalized = normalizeCountries(localData);
      inMemoryCache = normalized;
      return normalized;
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
}

export function findCountryByName(countries, name) {
  const target = typeof name === 'string' ? name : '';
  if (!Array.isArray(countries) || !target) return null;

  const exact = countries.find((c) => c.name === target);
  if (exact) return exact;

  const lowered = target.toLowerCase();
  return (
    countries.find((c) => c.name.toLowerCase() === lowered) ||
    countries.find((c) => c.name.toLowerCase().includes(lowered)) ||
    null
  );
}

export function clearCountriesCache() {
  inMemoryCache = null;
  inFlightPromise = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
