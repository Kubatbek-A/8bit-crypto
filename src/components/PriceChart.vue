<template>
  <div class="price-chart" ref="chartContainer">
    <div ref="chartElement" class="chart-element"></div>
    <div 
      v-if="showTooltip && tooltipData"
      class="price-tooltip"
      :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
    >
      <div class="tooltip-price">{{ tooltipData.price }}</div>
      <div class="tooltip-time">{{ tooltipData.time }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useChart } from '@/composables/useChart'
import type { ChartDataConfig, ChartWithResizeObserver, Optional } from '@/types'
import type { ISeriesApi, MouseEventParams, Time, AreaData } from 'lightweight-charts'

const props = defineProps<{
  data: ChartDataConfig;
  options?: Record<string, unknown>;
}>()

const {
  showTooltip,
  tooltipX,
  tooltipY,
  tooltipData,
  convertDataToLightweightFormat,
  getChartOptions,
  getAreaSeriesOptions,
  createCrosshairMoveHandler,
  createResizeObserver,
  initializeChart,
} = useChart()

const chartContainer = ref<HTMLElement | null>(null)
const chartElement = ref<HTMLElement | null>(null)
let chart: ChartWithResizeObserver | null = null
let areaSeries: ISeriesApi<"Area"> | null = null

const initChart = (): void => {
  if (!chartElement.value || !props.data) return
  
  if (chart) {
    if (chart._resizeObserver) {
      chart._resizeObserver.disconnect()
    }
    chart.remove()
    chart = null
    areaSeries = null
  }
  
  try {
    const result = initializeChart(chartElement.value, props.data, props.options)
    chart = result.chart
    areaSeries = result.areaSeries
    
    const crosshairHandler = createCrosshairMoveHandler(
      chart, 
      areaSeries!, 
      chartContainer.value!, 
      chartElement.value
    )
    chart!.subscribeCrosshairMove(crosshairHandler as (param: MouseEventParams<Time>) => void)
    
    const resizeObserver = createResizeObserver(chart, chartElement.value)
    chart!._resizeObserver = resizeObserver
    
  } catch (error) {
    console.error('Error initializing chart:', error)
  }
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

onUnmounted(() => {
  if (chart) {
    if (chart._resizeObserver) {
      chart._resizeObserver.disconnect()
    }
    chart.remove()
    chart = null
    areaSeries = null
  }
})

watch(() => props.data, (newData: ChartDataConfig, oldData: Optional<ChartDataConfig>) => {
  if (areaSeries && newData) {
    const { priceData } = convertDataToLightweightFormat(newData)
    if (priceData.length > 0) {
      const oldLightweightData = oldData ? convertDataToLightweightFormat(oldData) : { priceData: [] }
      
      if (oldLightweightData.priceData.length > 0 && priceData.length === oldLightweightData.priceData.length) {
        const lastPricePoint = priceData[priceData.length - 1]
        if (lastPricePoint) {
          areaSeries.update(lastPricePoint as AreaData<Time>)
        }
      } else {
        areaSeries.setData(priceData as AreaData<Time>[])
        if (chart) {
          chart.timeScale().fitContent()
        }
      }
      
      areaSeries.applyOptions(getAreaSeriesOptions())
    }
  } else {
    initChart()
  }
}, { deep: true })

watch(() => props.options, (): void => {
  if (chart) {
    chart.applyOptions(getChartOptions(props.options))
  }
}, { deep: true })
</script>

<style scoped>
.price-chart {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.chart-element {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.price-tooltip {
  position: absolute;
  background: rgba(43, 49, 57, 0.95);
  color: #f0f0f0;
  padding: 8px 12px;
  border-radius: 6px;
  font-family: 'SF Mono', Monaco, monospace;
  font-weight: 500;
  border: 1px solid #fcd535;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
}

.tooltip-price {
  font-size: 13px;
  font-weight: 600;
  color: #fcd535;
  margin-bottom: 2px;
}

.tooltip-time {
  font-size: 10px;
  color: #848e9c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


.price-tooltip::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -6px;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid #fcd535;
}
</style>