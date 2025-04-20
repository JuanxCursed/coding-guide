// No need to import anything, nuxt will handle the importsß
export const useUsers = () => {
  const userStore = useUserStore()
  const route = useRoute()

  const fetchUsers = async (): Promise<void> => {
    await userStore.fetchUsers()
  }

  const getUserById = computed((): User | null => {
    const userId = route.params.id as string
    return userStore.users.find(user => user.id === userId) || null
  })

  return {
    users: computed(() => userStore.users),
    currentUser: computed(() => userStore.currentUser),
    isLoading: computed(() => userStore.isLoading),
    error: computed(() => userStore.error),
    fetchUsers,
    getUserById
  }
} 