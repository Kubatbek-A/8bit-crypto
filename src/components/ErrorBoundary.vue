<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-display">
      <div class="error-icon">⚠️</div>
      <h3 class="error-title">{{ errorTitle }}</h3>
      <p class="error-message">{{ errorMessage }}</p>
      
      <div class="error-actions">
        <button 
          v-if="canRetry" 
          @click="handleRetry"
          class="btn btn-primary"
          :disabled="isRetrying"
        >
          {{ isRetrying ? 'Retrying...' : 'Try Again' }}
        </button>
        
        <button 
          @click="handleDismiss"
          class="btn btn-secondary"
        >
          Dismiss
        </button>
      </div>
      
      <details v-if="showDetails && errorDetails" class="error-details">
        <summary>Error Details</summary>
        <pre class="error-stack">{{ errorDetails }}</pre>
      </details>
    </div>
    
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useErrorHandler } from '@/composables/useErrorHandler'

const props = defineProps<{
  boundaryId?: string;
  showDetails?: boolean;
  title?: string;
  onRetry?: (() => void) | null;
  retryable?: boolean;
}>()

const emit = defineEmits(['error', 'retry', 'dismiss'])

const { 
  getError, 
  removeError, 
  formatErrorMessage,
  isRetryableError 
} = useErrorHandler()

const hasError = ref(false)
const currentError = ref<Error | Record<string, unknown> | null>(null)
const isRetrying = ref(false)

const errorTitle = computed(() => {
  if (currentError.value && typeof currentError.value === 'object' && 'title' in currentError.value) {
    return (currentError.value as Record<string, unknown>).title as string
  }
  return props.title
})

const errorMessage = computed(() => {
  if (!currentError.value) return ''
  const errorInfo = {
    message: currentError.value instanceof Error ? currentError.value.message : String(currentError.value),
    code: 'UNKNOWN_ERROR',
    timestamp: new Date(),
    retryable: false
  }
  return formatErrorMessage(errorInfo)
})

const errorDetails = computed(() => {
  if (!currentError.value) return ''
  if (currentError.value instanceof Error) {
    return currentError.value.stack || currentError.value.message || ''
  }
  if (typeof currentError.value === 'object' && currentError.value !== null) {
    const obj = currentError.value as Record<string, unknown>
    return (obj.stack as string) || (obj.message as string) || ''
  }
  return String(currentError.value)
})

const canRetry = computed(() => {
  return props.retryable && 
         currentError.value && 
         (props.onRetry || isRetryableError(currentError.value))
})

const captureError = (error: Error | Record<string, unknown>, info: Record<string, unknown> = {}): void => {
  currentError.value = {
    ...error,
    ...info,
    timestamp: new Date(),
    boundaryId: props.boundaryId
  }
  
  hasError.value = true
  
  emit('error', {
    error: currentError.value,
    boundaryId: props.boundaryId
  })
  
  console.error(`Error caught by boundary "${props.boundaryId}":`, error)
}

const handleRetry = async (): Promise<void> => {
  if (!canRetry.value || isRetrying.value) return
  
  isRetrying.value = true
  
  try {
    if (props.onRetry) {
      await props.onRetry()
    }
    
    handleDismiss()
    
    emit('retry', {
      error: currentError.value,
      boundaryId: props.boundaryId
    })
  } catch (retryError) {
    console.error('Retry failed:', retryError)
    captureError(retryError as Error, { isRetryError: true })
  } finally {
    isRetrying.value = false
  }
}

const handleDismiss = (): void => {
  hasError.value = false
  currentError.value = null
  removeError(props.boundaryId || 'default')
  
  emit('dismiss', {
    boundaryId: props.boundaryId
  })
}

const reset = () => {
  handleDismiss()
}

const handleGlobalError = (event: ErrorEvent): void => {
  if (event.error) {
    captureError(event.error, {
      type: 'javascript',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  }
}

const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
  captureError(event.reason, {
    type: 'promise',
    promise: true
  })
}

onMounted(() => {
  const existingError = getError(props.boundaryId || 'default')
  if (existingError) {
    captureError(existingError as unknown as Error)
  }
  
  window.addEventListener('error', handleGlobalError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
})

onUnmounted(() => {
  window.removeEventListener('error', handleGlobalError)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
})

defineExpose({
  captureError,
  reset,
  hasError: () => hasError.value,
  currentError: () => currentError.value
})
</script>

<style scoped>
.error-boundary {
  width: 100%;
}

.error-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  margin: 24px 0;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.error-title {
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 600;
}

.error-message {
  color: var(--text-secondary);
  margin-bottom: 24px;
  max-width: 400px;
  line-height: 1.5;
  font-size: 16px;
}

.error-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--yellow);
  color: var(--bg-primary);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--hover-bg);
  border-color: var(--yellow);
}

.error-details {
  width: 100%;
  max-width: 600px;
  text-align: left;
  margin-top: 16px;
}

.error-details summary {
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 8px;
}

.error-details summary:hover {
  color: var(--text-primary);
}

.error-stack {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 16px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .error-display {
    padding: 32px 16px;
  }
  
  .error-actions {
    flex-direction: column;
    width: 100%;
    max-width: 200px;
  }
  
  .error-message {
    font-size: 14px;
  }
}
</style>
