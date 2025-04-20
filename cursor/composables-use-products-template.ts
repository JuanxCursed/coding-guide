// No need to import anything, nuxt will handle the importsß
export const useProducts = () => {
  const productStore = useProductStore()

  const fetchProducts = async (): Promise<void> => {
    await productStore.fetchProducts()
  }

  const getProductById = (id: string): Product | undefined => {
    return productStore.products.find(product => product.id === id)
  }

  return {
    products: computed(() => productStore.products),
    isLoading: computed(() => productStore.isLoading),
    error: computed(() => productStore.error),
    fetchProducts,
    getProductById
  }
} 