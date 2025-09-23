<template>
  <div class="currency-switcher">
    <div 
      class="selected-currency" 
      @click="toggleDropdown"
      :class="{ active: isOpen }"
    >
      <img 
        v-if="selectedCurrencyInfo?.icon" 
        :src="`data:image/svg+xml;base64,${selectedCurrencyInfo.icon}`"
        :alt="selectedCurrencyInfo.ticker"
        class="currency-flag"
        @error="handleImageError"
      />
      <div 
        v-else-if="selectedCurrencyInfo?.ticker"
        class="currency-flag currency-flag-fallback"
      >
        {{ selectedCurrencyInfo.ticker.charAt(0).toUpperCase() }}
      </div>
      <span class="currency-code">{{ selectedCurrencyInfo?.ticker.toUpperCase() || selectedCurrency.toUpperCase() }}</span>
      <svg 
        class="dropdown-arrow" 
        :class="{ rotated: isOpen }"
        width="12" 
        height="12" 
        viewBox="0 0 12 12" 
        fill="currentColor"
      >
        <path d="M2 4l4 4 4-4H2z"/>
      </svg>
    </div>

    <div v-if="isOpen" class="currency-dropdown">
      <div class="dropdown-content">
        <div 
          v-for="currency in availableCurrencies" 
          :key="currency.code"
          class="currency-option"
          :class="{ active: currency.code === selectedCurrency }"
          @click="selectCurrency(currency.code)"
        >
          <img 
            v-if="currency.icon" 
            :src="`data:image/svg+xml;base64,${currency.icon}`"
            :alt="currency.ticker"
            class="currency-flag"
            @error="handleImageError"
          />
          <div 
            v-else
            class="currency-flag currency-flag-fallback"
          >
            {{ currency.ticker.charAt(0).toUpperCase() }}
          </div>
          <span class="currency-info">
            <span class="currency-code">{{ currency.ticker.toUpperCase() }}</span>
          </span>
          <svg 
            v-if="currency.code === selectedCurrency"
            class="check-icon" 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="currentColor"
          >
            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
          </svg>
        </div>
      </div>
    </div>

    <div 
      v-if="isOpen" 
      class="dropdown-backdrop"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCurrenciesStore } from '@/stores/modules/currencies'

const currenciesStore = useCurrenciesStore()
const { selectedCurrency, secondaryCurrencies, selectedCurrencyInfo } = storeToRefs(currenciesStore)

const isOpen = ref(false)

const availableCurrencies = computed(() => secondaryCurrencies.value)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectCurrency = (currencyCode: string): void => {
  currenciesStore.changeCurrency(currencyCode)
  closeDropdown()
}

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  console.warn('Currency flag image failed to load:', target.src)
  target.style.display = 'none'
  const fallback = target.nextElementSibling as HTMLElement
  if (fallback && fallback.classList.contains('currency-flag-fallback')) {
    fallback.style.display = 'flex'
  }
}

const handleClickOutside = (event: Event): void => {
  const switcher = document.querySelector('.currency-switcher')
  if (switcher && !switcher.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.currency-switcher {
  position: relative;
  display: inline-block;
}

.selected-currency {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
  user-select: none;
}

.selected-currency:hover {
  background: var(--hover-bg);
  border-color: var(--yellow);
}

.selected-currency.active {
  border-color: var(--yellow);
  background: var(--hover-bg);
}

.currency-flag {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
}

.currency-flag-fallback {
  background: var(--yellow);
  color: var(--bg-primary);
  font-weight: 700;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}

.currency-code {
  font-weight: 600;
  font-size: 12px;
  color: var(--text-primary);
}

.dropdown-arrow {
  margin-left: auto;
  color: var(--text-secondary);
  transition: transform 0.2s;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.currency-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  min-width: 120px;
}

.dropdown-content {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.currency-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid var(--border-color);
}

.currency-option:last-child {
  border-bottom: none;
}

.currency-option:hover {
  background: var(--hover-bg);
}

.currency-option.active {
  background: rgba(252, 213, 53, 0.1);
  color: var(--yellow);
}

.currency-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.currency-name {
  font-size: 12px;
  color: var(--text-secondary);
}

.check-icon {
  color: var(--yellow);
  margin-left: auto;
}

.dropdown-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

/* Animation */
.currency-dropdown {
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .selected-currency {
    padding: 8px 10px;
    min-width: 70px;
  }
  
  .currency-flag {
    width: 18px;
    height: 18px;
    min-width: 18px;
    min-height: 18px;
  }
  
  .currency-flag-fallback {
    font-size: 10px;
  }
  
  .currency-dropdown {
    left: 0;
    right: 0;
    min-width: 140px;
  }
  
  .currency-option {
    padding: 10px 12px;
  }
  
  .currency-option .currency-flag {
    width: 18px;
    height: 18px;
    min-width: 18px;
    min-height: 18px;
  }
}

@media (max-width: 480px) {
  .selected-currency {
    padding: 10px 12px;
    min-width: 80px;
  }
  
  .currency-flag {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
  }
  
  .currency-flag-fallback {
    font-size: 11px;
  }
  
  .currency-code {
    font-size: 13px;
    font-weight: 600;
  }
  
  .currency-dropdown {
    left: 0;
    right: 0;
    min-width: 160px;
  }
  
  .currency-option {
    padding: 12px 14px;
  }
  
  .currency-option .currency-flag {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
  }
  
  .currency-option .currency-code {
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
