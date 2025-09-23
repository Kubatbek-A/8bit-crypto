<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <router-link to="/" class="brand">
            <img src="@/assets/logo.svg" alt="Logo" class="logo" />
          </router-link>
          
          <div class="header-actions">
            <div class="search-container" v-if="$route.name === 'MarketOverview'">
              <input
                v-model="searchQuery"
                name="search"
                type="text"
                placeholder="Search crypto by name or symbol..."
                class="search-input"
              />
            </div>
            
            <div v-if="$route.name === 'CryptoDetail'" class="nav-actions">
              <router-link to="/" class="back-btn">
                ← Markets
              </router-link>
            </div>

            <CurrencySwitcher />
          </div>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <ErrorBoundary boundary-id="main-app" :retryable="true">
          <router-view />
        </ErrorBoundary>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useMarketStore } from '@/stores/modules/market'
import CurrencySwitcher from '@/components/CurrencySwitcher.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'

const marketStore = useMarketStore()
const { searchQuery } = storeToRefs(marketStore)

</script>

<style>
.app-main {
  padding: 24px 0;
  min-height: calc(100vh - 80px);
}

.brand {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: opacity 0.2s;
}

.brand:hover {
  opacity: 0.8;
}

.logo {
  height: 32px;
  width: auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.search-container {
  max-width: 400px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
    margin-left: 0;
  }
  
  .search-container {
    max-width: 100%;
    flex: 1;
    margin-right: 16px;
  }
}

@media (max-width: 480px) {
  .header-actions {
    gap: 12px;
    align-items: stretch;
  }
  
  .search-container {
    margin-right: 0;
  }
}
</style>