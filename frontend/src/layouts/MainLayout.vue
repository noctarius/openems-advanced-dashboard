<template>
  <v-app-bar color="primary">
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="toggleLeftDrawer" />
    </template>
    <v-app-bar-title> OpenEMS Advanced Dashboard v0.1 </v-app-bar-title>
  </v-app-bar>
  <v-navigation-drawer
    id="navigation"
    :permanent="true"
    :rail="leftDrawerOpen">
    <v-list>
      <v-list-item
        title="Components"
        class="text-start" />
      <v-spacer />
      <v-list-item
        v-for="link in linksList"
        :key="link.link"
        :to="link.link"
        :active="link.link === $route.path"
        :prepend-icon="link.icon"
        :title="link.title"
        class="text-start" />
      <v-list-item
        @click="openSettings"
        prepend-icon="mdi-cog"
        title="Settings"
        class="text-start" />
    </v-list>
  </v-navigation-drawer>
  <v-main>
    <v-container style="padding-right: 0">
      <router-view :key="$route.fullPath" />
    </v-container>
  </v-main>
  <SettingsModal
    :open="settingsOpen"
    @closed="settingsOpen = false" />
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import SettingsModal from "../modal/SettingsModal.vue";
import routes from "../router/routes";
import type {RouteRecordRaw} from "vue-router";

interface LinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

const linksList = computed<LinkProps[]>(() => {
  const links = (prefix: string, route: RouteRecordRaw): {title?: string; icon?: string; link: string}[] => {
    const link = `${prefix}${route.path}`;
    return [
      {
        title: route.name as string | undefined,
        icon: (route.meta && "icon" in route.meta ? route.meta.icon : "") as string,
        link,
      },
      ...(!route.children ? [] : route.children.flatMap(r => links(link, r))),
    ];
  };

  return routes.flatMap(route => links("", route)).filter(route => route.title) as LinkProps[];
});

const leftDrawerOpen = ref(false);
const settingsOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function openSettings() {
  settingsOpen.value = true;
}
</script>
