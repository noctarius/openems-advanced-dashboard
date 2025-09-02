<template>
  <v-responsive>
    <v-app class="overflow-x-hidden">
      <v-overlay
        v-if="isLoading"
        :model-value="isLoading"
        absolute
        opacity="0.9"
        class="d-flex align-center justify-center"
      >
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
        ></v-progress-circular>
      </v-overlay>
      <router-view v-if="!isLoading" />
    </v-app>
  </v-responsive>
</template>

<script setup lang="ts">
import { useConfigStore } from "./services/config";
import { ref } from "vue";
import { useRouter } from "vue-router";

const isLoading = ref(true);
const router = useRouter();

useConfigStore()
  .initialize()
  .then(config => {
    if (!config.system_data.ip_addr) {
      router.push("/wizard");
    } else {
      router.push("/dashboard");
    }
    isLoading.value = false;
  });
</script>
