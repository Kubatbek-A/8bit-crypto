<template>
  <div class="table-skeleton">
    <div class="table-container">
      <table class="market-table">
        <thead>
          <tr>
            <th><div class="skeleton-text skeleton-header"></div></th>
            <th><div class="skeleton-text skeleton-header"></div></th>
            <th><div class="skeleton-text skeleton-header"></div></th>
            <th><div class="skeleton-text skeleton-header"></div></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in 8" :key="n" class="skeleton-row">
            <td>
              <div class="currency-name">
                <div class="skeleton-icon"></div>
                <div class="skeleton-text-group">
                  <div class="skeleton-text skeleton-currency"></div>
                  <div class="skeleton-text skeleton-pair"></div>
                </div>
              </div>
            </td>
            <td><div class="skeleton-text skeleton-price"></div></td>
            <td><div class="skeleton-text skeleton-change"></div></td>
            <td><div class="skeleton-text skeleton-volume"></div></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-skeleton {
  width: 100%;
}

.table-container {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.market-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-secondary);
}

.market-table th,
.market-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.market-table th {
  background: var(--bg-tertiary);
}

.skeleton-row {
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-row:nth-child(even) {
  animation-delay: 0.1s;
}

.skeleton-row:nth-child(3n) {
  animation-delay: 0.2s;
}

.skeleton-text {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--hover-bg) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
  height: 16px;
}

.skeleton-header {
  height: 12px;
  width: 80px;
}

.skeleton-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--hover-bg) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.skeleton-currency {
  width: 60px;
  height: 14px;
  margin-bottom: 4px;
}

.skeleton-pair {
  width: 40px;
  height: 10px;
}

.skeleton-price {
  width: 80px;
}

.skeleton-change {
  width: 60px;
}

.skeleton-volume {
  width: 50px;
}

.currency-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-text-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .market-table th:nth-child(4),
  .market-table td:nth-child(4) {
    display: none;
  }
}

@media (max-width: 480px) {
  .market-table th:nth-child(3),
  .market-table td:nth-child(3) {
    display: none;
  }
}
</style>
