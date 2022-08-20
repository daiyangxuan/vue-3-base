<template>
  <div>{{ route.fullPath }}</div>
</template>

<script>
import {useRoute} from 'vue-router'
export default {
  name: 'Test',
  setup() {
    const route = useRoute()
    return {
      route,
    }
  },
}
</script>

<style scoped></style>
