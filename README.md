# Crypto Technical Analysis Dashboard 📈

A real-time cryptocurrency scanning interface built with React, TypeScript, and Vite that displays key technical indicators and price action data in a grid layout. Monitor multiple crypto pairs simultaneously with essential metrics and detailed analysis.

## Features 🚀

- **Real-time Data**: Live price updates for major cryptocurrency pairs
- **Technical Indicators**:
  - RSI (Relative Strength Index) for multiple timeframes
  - MACD (Moving Average Convergence Divergence)
  - Stochastic Oscillator
- **Price Action Analysis**:
  - Support and resistance levels
  - 24-hour price changes
  - Volume tracking
- **Interactive Grid**:
  - Expandable rows for detailed analysis
  - Customizable columns
  - Quick filters and sorting
- **Responsive Design**: Works seamlessly on desktop and tablet

## Tech Stack 💻

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: ShadcN UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data**: Binance API

## Getting Started 🏁

1. Clone the repository:
```bash
git clone <your-repo-url>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts 📝

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure 📁

```
src/
├── components/         # React components
│   ├── dashboard/     # Dashboard-specific components
│   └── ui/           # Reusable UI components
├── lib/              # Utility functions and API
├── types/            # TypeScript type definitions
└── main.tsx         # Application entry point
```

## Features in Detail 🔍

### Technical Indicators

- **RSI (Relative Strength Index)**
  - Available in Daily, 4H, and 1H timeframes
  - Color-coded for overbought/oversold conditions
  - Customizable period settings

- **MACD (Moving Average Convergence Divergence)**
  - Signal line crossover detection
  - Trend identification (Bullish/Bearish)
  - Multiple timeframe analysis

- **Stochastic Oscillator**
  - %K and %D line calculations
  - Overbought/Oversold signals
  - Buy/Sell signal detection

### Price Analysis

- Real-time price updates
- 24-hour price change tracking
- Volume analysis
- Support and resistance level identification

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments 🙏

- [Binance API](https://binance-docs.github.io/apidocs/) for real-time cryptocurrency data
- [ShadcN UI](https://ui.shadcn.com/) for beautiful React components
- [Recharts](https://recharts.org/) for responsive charting
- [Tailwind CSS](https://tailwindcss.com/) for styling
