# @pipeworx/fmp

[![MCP Queen operational grade](https://mcpqueen.com/badge/io.github.pipeworx-io/fmp.svg)](https://mcpqueen.com/s/io.github.pipeworx-io/fmp)

[Financial Modeling Prep v3](https://site.financialmodelingprep.com/developer/docs) MCP — company fundamentals, financial statements, ratios, valuation. Free 250 req/day.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Fmp data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
