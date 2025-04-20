<script setup lang="ts">
const { users, isLoading: usersLoading, fetchUsers } = useUsers()
const { products, isLoading: productsLoading, fetchProducts } = useProducts()

onMounted(async () => {
  await Promise.all([
    fetchUsers(),
    fetchProducts()
  ])
})
</script>

<template>
  <div>
    <div v-if="usersLoading || productsLoading">
      Loading...
    </div>
    <div v-else>
      <h2>Users</h2>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.name }}
        </li>
      </ul>

      <h2>Products</h2>
      <ul>
        <li v-for="product in products" :key="product.id">
          {{ product.name }}
        </li>
      </ul>
    </div>
  </div>
</template> 