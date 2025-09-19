# Crypto Market Summary

Vue 3 application for real-time cryptocurrency market monitoring.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Open
http://localhost:3000
```

## ✨ Key Features

- **Market Overview** - View all trading pairs with current prices
- **Search & Filter** - Search cryptocurrencies by name or ticker
- **Currency Switching** - Select base currency (AUD, USD, NZD, SGD)
- **Data Sorting** - Sort by name, price, 24h change, volume
- **Detailed Information** - Navigate to detailed cryptocurrency information with interactive price charts
- **Auto-refresh** - Data updates every 10 seconds automatically
- **Responsive Design** - Works on all devices

## 🛠️ Technologies

- **Vue 3** with Composition API
- **Pinia** for state management
- **Vue Router** for navigation
- **Vite** for bundling
- **Axios** for API requests
- **Lightweight Charts** for price charts visualization

## 📱 Interface

- **Main Page** - Table of all trading pairs with sorting capabilities and search functionality
- **Search Bar** - Real-time search by cryptocurrency name or ticker symbol
- **Currency Switcher** - Located in the top right corner for base currency selection
- **Detail Page** - Detailed information about specific cryptocurrency with interactive price charts
- **Price Charts** - Real-time candlestick charts powered by Lightweight Charts
- **Auto-refresh** - Data automatically updates every 10 seconds

## 🔧 API

The application uses the following API endpoints:

- **Market Data**: `https://requestly.tech/api/mockv2/test/api/market?username=user26614`
- **Currencies**: Uses constant data from `src/constants/currencies.js`

## 📱 Responsive Design

- Fully responsive design
