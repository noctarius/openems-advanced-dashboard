<template>
  <div style="width: 100%">
    <h2>{{ title }}</h2>
  </div>
  <div
    ref="content"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

defineProps<{
  title: string;
}>();

const content = ref<HTMLDivElement | null>(null);
onMounted(() => {
  if (content.value) {
    const navigation = document.getElementById("navigation");
    if (!navigation) return;

    const navigationStyle = window.getComputedStyle(navigation);
    content.value.style.maxHeight = `${navigationStyle.height}px`;
  }
});
</script>

<style scoped></style>
