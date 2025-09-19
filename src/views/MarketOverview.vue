<template>
  <div class="market-overview">


    <!-- Market Table -->
    <div v-if="filteredMarketData.length > 0" class="table-container">
      <table class="market-table">
        <thead>
          <tr>
            <th 
              @click="setSortBy('name')" 
              :class="{ 'sortable': true, 'active': sortBy === 'name' }"
            >
              <div class="th-content">
                <span>Name</span>
                <span class="sort-arrows">
                  <span :class="{ 'active': sortBy === 'name' && sortOrder === 'asc' }" class="arrow-up">▲</span>
                  <span :class="{ 'active': sortBy === 'name' && sortOrder === 'desc' }" class="arrow-down">▼</span>
                </span>
              </div>
            </th>
            <th 
              @click="setSortBy('price')" 
              :class="{ 'sortable': true, 'active': sortBy === 'price' }"
            >
              <div class="th-content">
                <span>{{ selectedCurrencyInfo?.ticker || selectedCurrency }} Price</span>
                <span class="sort-arrows">
                  <span :class="{ 'active': sortBy === 'price' && sortOrder === 'asc' }" class="arrow-up">▲</span>
                  <span :class="{ 'active': sortBy === 'price' && sortOrder === 'desc' }" class="arrow-down">▼</span>
                </span>
              </div>
            </th>
            <th 
              @click="setSortBy('change')" 
              :class="{ 'sortable': true, 'active': sortBy === 'change' }"
            >
              <div class="th-content">
                <span>24h Change</span>
                <span class="sort-arrows">
                  <span :class="{ 'active': sortBy === 'change' && sortOrder === 'asc' }" class="arrow-up">▲</span>
                  <span :class="{ 'active': sortBy === 'change' && sortOrder === 'desc' }" class="arrow-down">▼</span>
                </span>
              </div>
            </th>
            <th 
              @click="setSortBy('volume')" 
              :class="{ 'sortable': true, 'active': sortBy === 'volume' }"
            >
              <div class="th-content">
                <span>24h Volume</span>
                <span class="sort-arrows">
                  <span :class="{ 'active': sortBy === 'volume' && sortOrder === 'asc' }" class="arrow-up">▲</span>
                  <span :class="{ 'active': sortBy === 'volume' && sortOrder === 'desc' }" class="arrow-down">▼</span>
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="item in filteredMarketData" 
            :key="`${item.pair.primary}-${item.pair.secondary}`"
            @click="goToDetail(item)"
            class="market-row"
          >
            <td>
              <div class="currency-name">
                <div class="currency-icon-wrapper">
                  <img 
                    v-if="getCurrencyInfo(item.pair.primary)?.icon" 
                    :src="`data:image/svg+xml;base64,${getCurrencyInfo(item.pair.primary).icon}`"
                    :alt="getCurrencyInfo(item.pair.primary).ticker"
                    class="currency-icon"
                  />
                  <div 
                    v-else
                    class="currency-icon currency-icon-fallback"
                  >
                    {{ (getCurrencyInfo(item.pair.primary)?.ticker || item.pair.primary).charAt(0) }}
                  </div>
                </div>
                <div>
                  <div class="currency-ticker">
                    {{ getCurrencyInfo(item.pair.primary)?.ticker.toUpperCase() || item.pair.primary.toUpperCase() }}
                    <span class="currency-symbol">
                      /{{ item.pair.secondary }}
                    </span>
                  </div>
                </div>
              </div>
            </td>
            
            <td class="price-cell">
              {{ formatPrice(item.price.last, getCurrencyInfo(item.pair.primary)?.decimals_places || 2) }}
            </td>
            
            <td class="change-cell">
              <span :class="`price-${item.price.change.direction.toLowerCase()}`">
                {{ item.price.change.direction === 'Up' ? '+' : '-' }}{{ item.price.change.percent }}%
              </span>
            </td>
            
            <td class="volume-cell">
              {{ formatVolume(item.volume.secondary) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && marketData.length > 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <h3>No markets available for {{ selectedCurrencyInfo?.ticker || selectedCurrency }}</h3>
      <p>There are currently no trading pairs available for the selected currency. Please try selecting a different currency.</p>
      <div class="available-currencies">
        <span>Available currencies:</span>
        <div class="currency-badges">
          <button 
            v-for="currency in availableCurrencies" 
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
    </div>

    <!-- Loading State -->
    <TableSkeleton v-if="isInitialLoad && marketData.length === 0" />

    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="cryptoStore.fetchMarketData" class="btn btn-primary">Retry</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCryptoStore } from '../stores/crypto'
import { CURRENCIES_DATA } from '../constants/currencies'
import TableSkeleton from '../components/TableSkeleton.vue'

const router = useRouter()
const cryptoStore = useCryptoStore()

const { 
  marketData,
  filteredMarketData,
  loading,
  isInitialLoad,
  error,
  sortBy,
  sortOrder,
  selectedCurrency
} = storeToRefs(cryptoStore)

const getCurrencyInfo = (code) => cryptoStore.getCurrencyInfo(code)
const formatPrice = (price, decimals) => cryptoStore.formatPrice(price, decimals)
const formatVolume = (volume) => cryptoStore.formatVolume(volume)

const selectedCurrencyInfo = computed(() => 
  CURRENCIES_DATA.find(currency => currency.code === selectedCurrency.value)
)

const availableCurrencies = computed(() => {
  const currenciesWithPairs = new Set(marketData.value.map(item => item.pair.secondary))
  return CURRENCIES_DATA.filter(currency => 
    currency.type === 'Secondary' && currenciesWithPairs.has(currency.code)
  )
})

const changeCurrency = (currencyCode) => {
  cryptoStore.changeCurrency(currencyCode)
}

const setSortBy = (field) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    if (field === 'price' || field === 'volume') {
      sortOrder.value = 'desc'
    } else if (field === 'change') {
      sortOrder.value = 'desc'
    } else {
      sortOrder.value = 'asc'
    }
  }
}


const goToDetail = (item) => {
  router.push(`/crypto/${item.pair.primary.toLowerCase()}`)
}

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
</script>

<style scoped>
.market-overview {
  max-width: 100%;
}

.market-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  font-family: 'SF Mono', Monaco, monospace;
}

.filters-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-tab:hover {
  background: var(--hover-bg);
}

.filter-tab.active {
  background: var(--yellow);
  color: var(--bg-primary);
  border-color: var(--yellow);
}


/* Sortable table headers */
.market-table th.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: all 0.2s;
  padding: 12px 16px;
}

.market-table th.sortable:hover {
  background: var(--hover-bg);
}

.market-table th.sortable:hover .th-content {
  color: var(--text-primary);
}

.th-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: color 0.2s;
}

.sort-arrows {
  display: flex;
  flex-direction: column;
  gap: 1px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.market-table th.sortable:hover .sort-arrows {
  opacity: 0.8;
}

.arrow-up,
.arrow-down {
  font-size: 8px;
  line-height: 1;
  color: var(--text-muted);
  transition: color 0.2s;
}

.arrow-up.active,
.arrow-down.active {
  color: var(--yellow);
}

.market-table th.sortable.active .sort-arrows {
  opacity: 1;
}

.sort-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(252, 213, 53, 0.1);
  border: 1px solid rgba(252, 213, 53, 0.2);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  animation: fadeIn 0.5s ease;
}

.hint-icon {
  font-size: 14px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.table-container {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.market-row:hover {
  background: var(--hover-bg);
}

.currency-ticker {
  font-weight: 500;
  font-size: 14px;
}

.currency-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.currency-icon-fallback {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--yellow);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin: 24px 0;
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
}

.available-currencies {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
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

@media (max-width: 768px) {
  .market-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .filter-tabs {
    justify-content: center;
  }
  
  .market-table th:nth-child(4),
  .market-table td:nth-child(4) {
    display: none;
  }

  .sort-hint {
    font-size: 11px;
    padding: 6px 10px;
  }
}

@media (max-width: 480px) {
  .market-stats {
    grid-template-columns: 1fr;
  }
  
  .market-table th:nth-child(3),
  .market-table td:nth-child(3) {
    display: none;
  }

  .sort-hint {
    display: none;
  }
}
</style>
