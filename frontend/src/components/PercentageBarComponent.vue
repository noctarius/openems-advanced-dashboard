<template>
  <v-progress-linear
    :model-value="value"
    color="primary"
    height="25">
    <template #default="{value}">
      <span
        class="back"
        ref="backRef"
        >{{ valueString }}</span
      >
      <span
        class="front"
        ref="frontRef"
        >{{ valueString }}</span
      >
    </template>
  </v-progress-linear>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";

const props = defineProps<{value: number}>();
const frontRef = ref<HTMLSpanElement | null>(null);
const backRef = ref<HTMLSpanElement | null>(null);

const valueString = computed(() => `${props.value.toFixed(0)} %`);

const adjustProgressValue = () => {
  if (frontRef.value) {
    frontRef.value.style.clipPath = `inset(0 0 0 ${props.value}%)`;
  }
  if (backRef.value) {
    backRef.value.style.clipPath = `inset(0 ${100 - props.value}% 0 0)`;
  }
};

// Initial update
adjustProgressValue();

watch(props, adjustProgressValue);
watch(frontRef, adjustProgressValue);
</script>

<style lang="scss" scoped>
.back {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  background: transparent;
  color: black;
}

.front {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: transparent;
  color: rgb(var(--v-theme-secondary));
  clip-path: inset(0 0 0 0);
  transition: clip-path 0.25s linear;
}
</style>
