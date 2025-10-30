# Yaak Day.js Plugin

A [Yaak](https://yaak.app) plugin that provides Day.js date/time manipulation functions as template functions for API testing and development.

## Features

This plugin extends Yaak with powerful date/time manipulation capabilities using [Day.js](https://day.js.org/), a lightweight alternative to Moment.js.

### Template Functions

#### `dayjs`

Converts dates to ISO format or UTC JSON format.

**Parameters:**

- `dateTime` (optional): Base date/time string. Leave empty for current date/time
- `toUTCTime` (optional): Convert to UTC format

**Examples:**

- `{{dayjs()}}` - Current date/time in local format
- `{{dayjs("2024-01-15")}}` - Specific date in local format
- `{{dayjs("2024-01-15", true)}}` - Specific date in UTC format

#### `dayjs.format`

Formats dates using custom format strings.

**Parameters:**

- `dateTime`: Base date/time string
- `format`: Format pattern (optional, defaults to "YYYY-MM-DD HH:mm:ss")

**Examples:**

- `{{dayjs.format("2024-01-15T12:00:00", "MMM DD, YYYY")}}` - "Jan 15, 2024"
- `{{dayjs.format("2024-01-15T12:00:00", "dddd, MMMM Do YYYY")}}` - "Monday, January 15th 2024"

#### `dayjs.from`

Shows relative time from one date to another.

**Parameters:**

- `dateTime`: Target date/time
- `fromDate`: Reference date/time

**Examples:**

- `{{dayjs.from("2024-01-15", "2024-01-10")}}` - "5 days ago"
- `{{dayjs.from("2024-02-01", "2024-01-01")}}` - "in a month"

#### `dayjs.toISOString`

Converts dates to ISO 8601 string format.

**Parameters:**

- `dateTime`: Date/time string to convert

**Examples:**

- `{{dayjs.toISOString("2024-01-15T12:00:00")}}` - "2024-01-15T12:00:00.000Z"

## Installation

1. Download the plugin from the [releases page](https://github.com/aleksanderwalczuk/yaak-dayjs-plugin/releases)
2. Open Yaak and go to Settings → Plugins
3. Install the plugin by selecting the downloaded file

## Usage

### In Request URLs, Headers, and Bodies

Use the template functions anywhere in your HTTP requests:

```
POST {{baseUrl}}/api/events
Content-Type: application/json
Authorization: Bearer {{authToken}}

{
  "created_at": "{{dayjs()}}",
  "formatted_date": "{{dayjs.format("2024-01-15", "MMM DD, YYYY")}}",
  "relative_time": "{{dayjs.from("2024-01-15", "2024-01-10")}}"
}
```

### Date Validation

The plugin automatically validates input dates. If an invalid date is provided, it will:

- Display an "Invalid Date" error message in Yaak
- Still attempt to process the request (for backward compatibility)

## Supported Day.js Features

This plugin includes the following Day.js plugins:

- **UTC**: Time zone manipulation
- **Relative Time**: Human-readable time differences
- **Advanced Format**: Extended formatting options
- **Duration**: Time duration calculations
- **Localized Format**: Locale-aware formatting

## Common Format Patterns

| Pattern                    | Example Output            | Description  |
| -------------------------- | ------------------------- | ------------ |
| `YYYY-MM-DD`               | 2024-01-15                | ISO date     |
| `HH:mm:ss`                 | 14:30:45                  | 24-hour time |
| `MMM DD, YYYY`             | Jan 15, 2024              | Short date   |
| `dddd, MMMM Do YYYY`       | Monday, January 15th 2024 | Full date    |
| `YYYY-MM-DDTHH:mm:ss.SSSZ` | 2024-01-15T14:30:45.123Z  | ISO datetime |

## Development

### Prerequisites

- Node.js >= 18
- pnpm

### Setup

```bash
git clone https://github.com/aleksanderwalczuk/yaak-dayjs-plugin.git
cd yaak-dayjs-plugin
pnpm install
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

### Lint

```bash
pnpm lint
pnpm lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `pnpm test`
6. Submit a pull request

## License

UNLICENSED

## Author

**Aleksander Walczuk** - [ohleg@windowslive.com](mailto:ohleg@windowslive.com)

## Links

- [GitHub Repository](https://github.com/aleksanderwalczuk/yaak-dayjs-plugin)
- [Issues](https://github.com/aleksanderwalczuk/yaak-dayjs-plugin/issues)
- [Yaak](https://yaak.app)
- [Day.js Documentation](https://day.js.org/docs/)
