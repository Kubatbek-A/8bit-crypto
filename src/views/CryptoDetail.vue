<template>
  <div class="crypto-detail">
    <div v-if="cryptoData" class="detail-content">


      <div class="market-stats-bar">
        <div class="crypto-name">
          <div class="crypto-icon-wrapper">
            <img 
              v-if="primaryCurrency?.icon" 
              :src="`data:image/svg+xml;base64,${primaryCurrency.icon}`"
              :alt="primaryCurrency.ticker"
              class="crypto-icon"
            />
            <div 
              v-else
              class="crypto-icon crypto-icon-fallback"
            >
              {{ (primaryCurrency?.ticker || props.primary).charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="name-info">
            <h2>{{ primaryCurrency?.ticker.toUpperCase() || props.primary.toUpperCase() }}</h2>
            <span class="crypto-code">{{ props.primary.toUpperCase() }}</span>
          </div>
        </div>
        
        <div class="stat-item price-stat">
          <span class="stat-label">{{ selectedCurrencyInfo?.ticker || selectedCurrency }} Price:</span>
          <span class="stat-value">{{ formatPrice(cryptoData.price.last, primaryCurrency?.decimals_places || 2) }}</span>
        </div>
        
        <div class="mobile-price">
          <span class="stat-value">{{ formatPrice(cryptoData.price.last, primaryCurrency?.decimals_places || 2) }}</span>
        </div>
        
        <div class="other-stats">
          <div class="stat-item">
            <span class="stat-label">24h Change:</span>
            <span :class="`stat-value price-${cryptoData.price.change.direction.toLowerCase()}`">
              {{ cryptoData.price.change.direction === 'Up' ? '+' : '-' }}{{ cryptoData.price.change.percent }}%
              <span class="change-amount">{{ cryptoData.price.change.direction === 'Up' ? '+' : '-' }}{{ formatPrice(cryptoData.price.change.amount, primaryCurrency?.decimals_places || 2) }}</span>
            </span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">24h Volume:</span>
            <span class="stat-value">{{ formatVolume(cryptoData.volume.primary) }}</span>
          </div>
          
          <div class="stat-item">
            <span class="stat-label">24h Volume {{ selectedCurrencyInfo?.ticker || selectedCurrency }}:</span>
            <span class="stat-value">{{ formatVolume(cryptoData.volume.secondary) }}</span>
          </div>
        </div>
        
      </div>

      <div class="chart-section">
        <div class="chart-container">
          <PriceChart 
            :data="chartData" 
            :options="chartOptions"
          />
        </div>
      </div>
    </div>

    <div v-else-if="!isInitialLoad" class="empty-state">
      <div class="empty-icon">📊</div>
      <h3>No data available for {{ primaryCurrency?.ticker || props.primary }}/{{ selectedCurrencyInfo?.ticker || selectedCurrency }}</h3>
      <p>There is currently no trading pair available for {{ primaryCurrency?.ticker || props.primary }} in {{ selectedCurrencyInfo?.ticker || selectedCurrency }}. Please try selecting a different currency.</p>
      <div class="available-currencies">
        <span>Available currencies for {{ primaryCurrency?.ticker || props.primary }}:</span>
        <div class="currency-badges">
          <button 
            v-for="currency in availableCurrenciesForCrypto" 
            :key="currency.code"
            class="currency-badge"
            @click="changeCurrency(currency.code)"
          >
            <img 
              v-if="currency.icon" 
              :src="`data:image/svg+xml;base64,${currency.icon}`"
              :alt="currency.ticker"
              class="badge-icon"
            />
            {{ currency.ticker }}
          </button>
        </div>
      </div>
      <div class="back-action">
        <router-link to="/" class="back-btn">
          ← Back to Markets
        </router-link>
      </div>
    </div>

    <DetailSkeleton v-else />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCryptoStore } from '../stores/crypto'
import { CURRENCIES_DATA } from '../constants/currencies'
import PriceChart from '../components/PriceChart.vue'
import DetailSkeleton from '../components/DetailSkeleton.vue'

const props = defineProps({
  primary: {
    type: String,
    required: true
  }
})

const cryptoStore = useCryptoStore()
const { marketData, selectedCurrency, isInitialLoad } = storeToRefs(cryptoStore)

const cryptoData = computed(() => {
  return cryptoStore.getCryptoData(props.primary, selectedCurrency.value)
})

const primaryCurrency = computed(() => 
  cryptoStore.getCurrencyInfo(props.primary)
)

const selectedCurrencyInfo = computed(() => 
  CURRENCIES_DATA.find(currency => currency.code === selectedCurrency.value)
)

const availableCurrenciesForCrypto = computed(() => {
  const availableCodes = new Set(
    marketData.value
      .filter(item => item.pair.primary === props.primary)
      .map(item => item.pair.secondary)
  )
  
  return CURRENCIES_DATA.filter(currency => 
    currency.type === 'Secondary' && availableCodes.has(currency.code)
  )
})

const chartData = computed(() => {
  if (!cryptoData.value?.priceHistory) return { labels: [], datasets: [] }
  
  const prices = cryptoData.value.priceHistory.map(p => parseFloat(p))
  const labels = prices.map((_, index) => `${index + 1}`)
  
  return {
    labels,
    datasets: [{
      label: 'Price',
      data: prices,
      borderColor: '#2296f3',
      backgroundColor: 'rgba(41, 98, 255, 0.28)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#2296f3',
      pointHoverBorderColor: '#fff',
      pointHoverBorderWidth: 2
    }]
  }
})

const chartOptions = computed(() => ({
  rightPriceScale: {
    scaleMargins: {
      top: 0.1,
      bottom: 0.1
    }
  }
}))

const formatPrice = (price, decimals) => cryptoStore.formatPrice(price, decimals)
const formatVolume = (volume) => cryptoStore.formatVolume(volume)
const changeCurrency = (currencyCode) => cryptoStore.changeCurrency(currencyCode)

onMounted(async () => {
  await Promise.all([
    cryptoStore.fetchCurrencies(),
    cryptoStore.fetchMarketData()
  ])
  cryptoStore.startPolling()
})

onUnmounted(() => {
  cryptoStore.stopPolling()
})

watch(() => selectedCurrency.value, () => {
}, { immediate: true })
</script>

<style scoped>
.crypto-detail {
  max-width: 100%;
  min-height: 60vh;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.currency-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.currency-icon-large {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.currency-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.currency-pair {
  color: var(--text-secondary);
  font-weight: 400;
}

.currency-type {
  color: var(--text-secondary);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.price-info {
  text-align: right;
}

.detail-price {
  font-size: 32px;
  font-weight: 700;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.detail-change {
  font-size: 16px;
  font-weight: 600;
}

.detail-change.price-up {
  color: var(--green);
}

.detail-change.price-down {
  color: var(--red);
}

.detail-change .change-amount {
  font-size: 14px;
  margin-left: 8px;
}

.market-stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  min-height: 60px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.crypto-name {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 140px;
}

.crypto-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.crypto-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.crypto-icon-fallback {
  background: var(--yellow);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.name-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-info h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  line-height: 1;
}

.crypto-code {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  line-height: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 120px;
  white-space: nowrap;
  text-align: center;
}

.mobile-price {
  display: none;
}

.other-stats {
  display: contents;
}

.stat-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
  color: var(--text-primary);
}

.change-amount {
  font-size: 12px;
  margin-left: 4px;
}

.price-up {
  color: var(--green) !important;
}

.price-down {
  color: var(--red) !important;
}

.price-up .change-amount {
  color: var(--green);
}

.price-down .change-amount {
  color: var(--red);
}


.chart-section {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.chart-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.chart-period {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.chart-period:hover {
  background: var(--hover-bg);
}

.chart-period.active {
  background: var(--yellow);
  color: var(--bg-primary);
  border-color: var(--yellow);
}

.chart-container {
  height: 400px;
  position: relative;
  background: var(--bg-primary);
  border-radius: 4px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 64px 32px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 24px;
  max-width: 400px;
  line-height: 1.5;
  font-size: 16px;
  font-weight: normal;
}

.available-currencies {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
}

.available-currencies > span {
  color: var(--text-secondary);
  font-size: 14px;
}

.currency-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.currency-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  font-weight: 500;
}

.currency-badge:hover {
  background: var(--hover-bg);
  border-color: var(--yellow);
  transform: translateY(-1px);
}

.badge-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.back-action {
  margin-top: 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;
}

.back-btn:hover {
  background: var(--hover-bg);
  border-color: var(--yellow);
}


@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }
  
  .price-info {
    text-align: left;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .chart-controls {
    align-self: stretch;
    justify-content: center;
  }
  
  .market-stats-bar {
    padding: 12px 16px;
    gap: 12px;
  }
  
  .crypto-name {
    min-width: 100px;
  }
  
  .crypto-icon {
    width: 24px;
    height: 24px;
  }
  
  .crypto-icon-wrapper {
    width: 24px;
    height: 24px;
  }
  
  .crypto-icon-fallback {
    font-size: 12px;
  }
  
  .name-info h2 {
    font-size: 14px;
  }
  
  .stat-item {
    min-width: 80px;
  }
  
  .stat-label {
    font-size: 10px;
  }
  
  .stat-value {
    font-size: 12px;
  }
  
  .chart-container {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .market-stats-bar {
    flex-direction: column;
    padding: 16px;
    gap: 12px;
    align-items: stretch;
    position: relative;
  }
  
  .mobile-price {
    display: block;
    position: absolute;
    top: 16px;
    right: 16px;
  }
  
  .mobile-price .stat-value {
    font-size: 18px;
    font-weight: 700;
    font-family: 'SF Mono', Monaco, monospace;
    color: var(--text-primary);
  }
  
  .price-stat {
    display: none;
  }
  
  .crypto-name {
    justify-content: flex-start;
    min-width: auto;
    gap: 12px;
    position: relative;
    padding-right: 120px; /* Make room for price */
  }
  
  .crypto-icon {
    width: 24px;
    height: 24px;
  }
  
  .crypto-icon-wrapper {
    width: 24px;
    height: 24px;
  }
  
  .crypto-icon-fallback {
    font-size: 12px;
  }
  
  .name-info h2 {
    font-size: 16px;
  }
  
  .crypto-code {
    font-size: 11px;
  }
  
  .other-stats {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }
  
  .other-stats .stat-item {
    flex: 1;
    min-width: auto;
    text-align: center;
  }
  
  .stat-item {
    flex-direction: column;
    gap: 4px;
  }
  
  .stat-label {
    font-size: 10px;
  }
  
  .stat-value {
    font-size: 12px;
  }
  
  .change-amount {
    font-size: 10px;
    display: block;
    margin-left: 0;
    margin-top: 2px;
  }
  
  .currency-title {
    font-size: 24px;
  }
  
  .detail-price {
    font-size: 28px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 16px;
  }
}
</style>