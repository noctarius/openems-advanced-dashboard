<template>
  <!--q-item clickable :active="active" @click="$emit('click', $event)">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon"/>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item-->
</template>

<script setup lang="ts">
export interface LinkProps {
  title: string;
  caption?: string;
  icon?: string;
  active: boolean;
}

withDefaults(defineProps<LinkProps>(), {
  caption: "",
  link: "#",
  icon: "",
  active: false,
});

defineEmits(["click"]);
</script>
