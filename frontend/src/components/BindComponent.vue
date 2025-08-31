<template>
  <slot :model="model">
  </slot>
</template>

<script setup lang="ts">
const model = defineModel<any>();
</script>
