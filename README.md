# @pipeworx/fmp

[Financial Modeling Prep v3](https://site.financialmodelingprep.com/developer/docs) MCP — company fundamentals, financial statements, ratios, valuation. Free 250 req/day.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1856+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Auth

- Platform: `PLATFORM_FMP_KEY`. BYO: `?_apiKey=…`.

## Tools

### Profile / quote
- `profile(symbol)` — company profile
- `quote(symbol)` — current quote (comma-sep for batch)
- `quote_short(symbol)` — minimal quote
- `historical_price(symbol, from?, to?, serietype?)` — daily history
- `intraday(symbol, interval)` — intraday (`1min|5min|15min|30min|1hour|4hour`)

### Statements
- `income_statement(symbol, period?, limit?)` — income statement (`annual|quarter`)
- `balance_sheet(symbol, period?, limit?)` — balance sheet
- `cash_flow(symbol, period?, limit?)` — cash flow
- `ratios(symbol, period?, limit?)` — financial ratios
- `enterprise_value(symbol, period?, limit?)` — EV
- `key_metrics(symbol, period?, limit?)` — TTM key metrics
- `financial_growth(symbol, period?, limit?)` — growth rates

### Reference
- `search(query, limit?, exchange?)` — symbol search
- `search_ticker(query, limit?, exchange?)` — ticker search
- `stock_screener(marketCapMoreThan?, marketCapLowerThan?, sector?, industry?, country?, exchange?, dividendMoreThan?, dividendLowerThan?, betaMoreThan?, betaLowerThan?, volumeMoreThan?, volumeLowerThan?, isEtf?, isActivelyTrading?, limit?)` — screener
- `available_symbols()` — full symbol list

### Events / news
- `stock_news(tickers?, page?, limit?)` — news
- `earnings_calendar(from?, to?)` — earnings
- `economic_calendar(from?, to?)` — economic events
- `ipos(from?, to?)` — IPOs
- `mergers(page?)` — M&A
- `delisted()` — delisted companies

### Ownership
- `insider_trading(symbol?, page?, limit?)` — insider trading
- `institutional_holders(symbol)` — institutional holders
- `etf_holders(symbol)` — ETF holders

## Data source

`https://financialmodelingprep.com/api/v3`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "fmp": {
      "url": "https://gateway.pipeworx.io/fmp/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/fmp/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1856+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/fmp_profile \
  -H 'Content-Type: application/json' \
  -d '{"symbol":"AAPL"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/fmp_profile`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-fmp` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/fmp/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "fmp": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-fmp"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Fmp data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
