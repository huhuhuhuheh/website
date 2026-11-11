import { ref } from 'vue'

const KEY = 'ehis:cat-mode'

export const ErrorCat = ref(false)

try {
  ErrorCat.value = localStorage.getItem(KEY) === '1'
} catch {
}

export function setErrorCat(value) {
  ErrorCat.value = Boolean(value)
  try {
    localStorage.setItem(KEY, ErrorCat.value ? '1' : '0')
  } catch {
  }
}