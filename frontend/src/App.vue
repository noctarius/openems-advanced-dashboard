<template>
  <v-responsive>
    <v-app
        class="overflow-x-hidden"
    >
      <router-view/>
    </v-app>
  </v-responsive>
</template>

<script setup lang="ts">
import {useComponentsStore} from "./stores/openems-components-store";

const componentStore = useComponentsStore();
componentStore.initialize();
</script>
