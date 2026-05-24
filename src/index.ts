interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Financial Modeling Prep MCP.
 */


const BASE = 'https://financialmodelingprep.com/api/v3';
const UA = 'pipeworx-mcp-fmp/1.0 (+https://pipeworx.io)';

const passthrough = { type: 'object' as const, properties: {}, additionalProperties: true };

const tools: McpToolExport['tools'] = [
  { name: 'profile', description: 'Company profile.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] } },
  { name: 'quote', description: 'Current quote (comma-sep for batch).', inputSchema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] } },
  { name: 'quote_short', description: 'Minimal quote.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] } },
  {
    name: 'historical_price',
    description: 'Daily history.',
    inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, from: { type: 'string' }, to: { type: 'string' }, serietype: { type: 'string' } }, required: ['symbol'] },
  },
  { name: 'intraday', description: 'Intraday OHLC.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, interval: { type: 'string' } }, required: ['symbol', 'interval'] } },
  { name: 'income_statement', description: 'Income statement.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, period: { type: 'string' }, limit: { type: 'number' } }, required: ['symbol'] } },
  { name: 'balance_sheet', description: 'Balance sheet.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, period: { type: 'string' }, limit: { type: 'number' } }, required: ['symbol'] } },
  { name: 'cash_flow', description: 'Cash flow.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, period: { type: 'string' }, limit: { type: 'number' } }, required: ['symbol'] } },
  { name: 'ratios', description: 'Financial ratios.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, period: { type: 'string' }, limit: { type: 'number' } }, required: ['symbol'] } },
  { name: 'enterprise_value', description: 'Enterprise value.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, period: { type: 'string' }, limit: { type: 'number' } }, required: ['symbol'] } },
  { name: 'key_metrics', description: 'TTM key metrics.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, period: { type: 'string' }, limit: { type: 'number' } }, required: ['symbol'] } },
  { name: 'financial_growth', description: 'Growth rates.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, period: { type: 'string' }, limit: { type: 'number' } }, required: ['symbol'] } },
  { name: 'search', description: 'Symbol search.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' }, exchange: { type: 'string' } }, required: ['query'] } },
  { name: 'search_ticker', description: 'Ticker search.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number' }, exchange: { type: 'string' } }, required: ['query'] } },
  { name: 'stock_screener', description: 'Stock screener.', inputSchema: passthrough },
  { name: 'available_symbols', description: 'Full symbol list.', inputSchema: { type: 'object', properties: {} } },
  { name: 'stock_news', description: 'News.', inputSchema: { type: 'object', properties: { tickers: { type: 'string' }, page: { type: 'number' }, limit: { type: 'number' } } } },
  { name: 'earnings_calendar', description: 'Earnings calendar.', inputSchema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } } } },
  { name: 'economic_calendar', description: 'Economic events calendar.', inputSchema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } } } },
  { name: 'ipos', description: 'IPO calendar.', inputSchema: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } } } },
  { name: 'mergers', description: 'M&A.', inputSchema: { type: 'object', properties: { page: { type: 'number' } } } },
  { name: 'delisted', description: 'Delisted companies.', inputSchema: { type: 'object', properties: {} } },
  { name: 'insider_trading', description: 'Insider trading.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' }, page: { type: 'number' }, limit: { type: 'number' } } } },
  { name: 'institutional_holders', description: 'Institutional holders.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] } },
  { name: 'etf_holders', description: 'ETF holders.', inputSchema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('FMP requires an API key. Set PLATFORM_FMP_KEY or pass ?_apiKey=… (free at https://site.financialmodelingprep.com/developer/docs).');
  const get = async (path: string, params?: Record<string, unknown>) => {
    const p = new URLSearchParams({ apikey: apiKey });
    if (params) for (const [k, v] of Object.entries(params)) if (k !== '_apiKey' && v != null) p.set(k, String(v));
    const res = await fetch(`${BASE}${path}?${p}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
    if (res.status === 401 || res.status === 403) throw new Error('FMP: invalid API key.');
    if (res.status === 429) throw new Error('FMP: 429 rate limit (free tier 250/day).');
    if (!res.ok) throw new Error(`FMP: ${res.status}`);
    return res.json();
  };
  const reqStr = (k: string, ex: string) => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return v;
  };
  const sym = () => encodeURIComponent(reqStr('symbol', '"AAPL"'));
  switch (name) {
    case 'profile':
      return get(`/profile/${sym()}`);
    case 'quote':
      return get(`/quote/${sym()}`);
    case 'quote_short':
      return get(`/quote-short/${sym()}`);
    case 'historical_price':
      return get(`/historical-price-full/${sym()}`, { from: args.from, to: args.to, serietype: args.serietype });
    case 'intraday':
      return get(`/historical-chart/${encodeURIComponent(reqStr('interval', '"1hour"'))}/${sym()}`);
    case 'income_statement':
      return get(`/income-statement/${sym()}`, { period: args.period, limit: args.limit });
    case 'balance_sheet':
      return get(`/balance-sheet-statement/${sym()}`, { period: args.period, limit: args.limit });
    case 'cash_flow':
      return get(`/cash-flow-statement/${sym()}`, { period: args.period, limit: args.limit });
    case 'ratios':
      return get(`/ratios/${sym()}`, { period: args.period, limit: args.limit });
    case 'enterprise_value':
      return get(`/enterprise-values/${sym()}`, { period: args.period, limit: args.limit });
    case 'key_metrics':
      return get(`/key-metrics/${sym()}`, { period: args.period, limit: args.limit });
    case 'financial_growth':
      return get(`/financial-growth/${sym()}`, { period: args.period, limit: args.limit });
    case 'search':
      return get('/search', { query: reqStr('query', '"apple"'), limit: args.limit, exchange: args.exchange });
    case 'search_ticker':
      return get('/search-ticker', { query: reqStr('query', '"AAPL"'), limit: args.limit, exchange: args.exchange });
    case 'stock_screener':
      return get('/stock-screener', args);
    case 'available_symbols':
      return get('/available-traded/list');
    case 'stock_news':
      return get('/stock_news', args);
    case 'earnings_calendar':
      return get('/earning_calendar', args);
    case 'economic_calendar':
      return get('/economic_calendar', args);
    case 'ipos':
      return get('/ipo_calendar', args);
    case 'mergers':
      return get('/mergers-acquisitions-rss-feed', args);
    case 'delisted':
      return get('/delisted-companies');
    case 'insider_trading':
      return get('/insider-trading', args);
    case 'institutional_holders':
      return get(`/institutional-holder/${sym()}`);
    case 'etf_holders':
      return get(`/etf-holder/${sym()}`);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
