<template>
  <div class="detail-skeleton">
    <div class="market-stats-bar">
      <div class="crypto-name">
        <div class="skeleton-icon-large"></div>
        <div class="name-info">
          <div class="skeleton-text skeleton-title"></div>
          <div class="skeleton-text skeleton-code"></div>
        </div>
      </div>
      
      <div class="stat-item">
        <div class="skeleton-text skeleton-label"></div>
        <div class="skeleton-text skeleton-value"></div>
      </div>
      
      <div class="stat-item">
        <div class="skeleton-text skeleton-label"></div>
        <div class="skeleton-text skeleton-value"></div>
      </div>
      
      <div class="stat-item">
        <div class="skeleton-text skeleton-label"></div>
        <div class="skeleton-text skeleton-value"></div>
      </div>
      
      <div class="stat-item">
        <div class="skeleton-text skeleton-label"></div>
        <div class="skeleton-text skeleton-value"></div>
      </div>
    </div>

    <div class="chart-section">
      <div class="chart-skeleton">
        <div class="chart-skeleton-content">
          <div class="skeleton-chart-area"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-skeleton {
  max-width: 100%;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.skeleton-icon-large {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--hover-bg) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  flex-shrink: 0;
}

.name-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 120px;
  text-align: center;
}

.skeleton-text {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--hover-bg) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  width: 80px;
  height: 16px;
}

.skeleton-code {
  width: 40px;
  height: 12px;
}

.skeleton-label {
  width: 60px;
  height: 11px;
}

.skeleton-value {
  width: 70px;
  height: 14px;
}

.chart-section {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--border-color);
}

.chart-skeleton {
  height: 400px;
  position: relative;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.chart-skeleton-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-chart-area {
  width: 90%;
  height: 80%;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--hover-bg) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
  position: relative;
}

.skeleton-chart-area::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 10%;
  right: 10%;
  bottom: 20%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    var(--hover-bg) 50%,
    transparent 70%
  );
  border-radius: 4px;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (max-width: 768px) {
  .market-stats-bar {
    padding: 12px 16px;
    gap: 12px;
  }
  
  .crypto-name {
    min-width: 100px;
  }
  
  .skeleton-icon-large {
    width: 24px;
    height: 24px;
  }
  
  .stat-item {
    min-width: 80px;
  }
  
  .chart-skeleton {
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
  
  .crypto-name {
    justify-content: flex-start;
    min-width: auto;
    gap: 12px;
  }
  
  .stat-item {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }
}
</style>
