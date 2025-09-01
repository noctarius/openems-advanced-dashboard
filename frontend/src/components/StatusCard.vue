<template>
  <v-row>
    <v-col
      cols="6"
      align="start"
    >
      <component
        :is="titleRender.type"
        v-bind="titleRender.props"
      />
    </v-col>
    <v-col
      cols="6"
      align="end"
    >
      <component
        :is="valueRender.type"
        v-bind="valueRender.props"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { Component as VueComponent, computed } from "vue";

export type NodeDefinition = { type: string | VueComponent; props: { [key: string]: any } };

export interface StatusCardProps {
  title: string | (() => NodeDefinition | string);
  value: string | (() => NodeDefinition | string);
}

const props = defineProps<StatusCardProps>();

const titleRender = computed<NodeDefinition>(() => {
  if (typeof props.title === "function") {
    const val = props.title();
    if (typeof val === "string") {
      return {
        type: "div",
        props: {
          innerText: val,
        },
      };
    }
    return val;
  }
  return {
    type: "div",
    props: {
      innerText: props.title,
    },
  };
});

const valueRender = computed(() => {
  if (typeof props.value === "function") {
    const val = props.value();
    if (typeof val === "string") {
      return {
        type: "div",
        props: {
          innerText: val,
        },
      };
    }
    return val;
  }
  return {
    type: "div",
    props: {
      innerText: props.value,
    },
  };
});
</script>

<style scoped></style>
