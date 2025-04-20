import { defineStore } from 'pinia'
// No need to import anything, nuxt will handle the importsß

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  const fetchUsers = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      users.value = await useFetch('/api/users')
    } catch (err) {
      error.value = err as Error
    } finally {
      isLoading.value = false
    }
  }

  return {
    users,
    currentUser,
    isLoading,
    error,
    fetchUsers
  }
}) 