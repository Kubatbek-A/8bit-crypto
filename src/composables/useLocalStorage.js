import { ref, watch } from "vue";

export function useLocalStorage(key, defaultValue) {
  if (typeof key !== "string" || key.length === 0) {
    throw new Error("Storage key must be a non-empty string");
  }

  const readFromStorage = () => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;

      try {
        return JSON.parse(item);
      } catch (parseError) {
        if (typeof item === "string" && item.length > 0) {
          console.warn(
            `localStorage key "${key}" contains non-JSON value, using as string:`,
            item
          );
          return item;
        }
        throw parseError;
      }
    } catch (error) {
      console.warn(`Failed to read from localStorage key "${key}":`, error);
      return defaultValue;
    }
  };

  const writeToStorage = (value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to write to localStorage key "${key}":`, error);
    }
  };

  const storedValue = ref(readFromStorage());

  watch(
    storedValue,
    (newValue) => {
      writeToStorage(newValue);
    },
    { deep: true }
  );

  const removeFromStorage = () => {
    try {
      localStorage.removeItem(key);
      storedValue.value = defaultValue;
    } catch (error) {
      console.error(`Failed to remove from localStorage key "${key}":`, error);
    }
  };

  const reset = () => {
    storedValue.value = defaultValue;
  };

  return {
    value: storedValue,
    remove: removeFromStorage,
    reset,
  };
}
