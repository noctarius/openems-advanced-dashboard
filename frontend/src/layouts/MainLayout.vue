<template>
  <v-app-bar
      color="primary"
  >
    <template
        v-slot:prepend
    >
      <v-app-bar-nav-icon
          @click="toggleLeftDrawer"
      />
    </template>
    <v-app-bar-title>
      OpenEMS Advanced Dashboard v0.1
    </v-app-bar-title>
  </v-app-bar>
  <v-navigation-drawer
      id="navigation"
      :permanent="true"
      :rail="leftDrawerOpen"
  >
    <v-list>
      <v-list-item
          title="Components"
          align="start"
      />
      <v-spacer/>
      <v-list-item
          v-for="link in linksList"
          :key="link.title"
          :to="link.link"
          :prepend-icon="link.icon"
          :title="link.title"
          align="start"
      />
      <v-list-item
          @click="openSettings"
          prepend-icon="mdi-cog"
          title="Settings"
          align="start"
      />
    </v-list>
  </v-navigation-drawer>
  <v-main>
    <v-container
        style="padding-right: 0"
    >
      <suspense>
        <router-view/>
      </suspense>
    </v-container>
  </v-main>
  <SettingsModal
      :open="settingsOpen"
      @closed="settingsOpen = false"
  />
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {EssentialLinkProps} from '../components/EssentialLink.vue';
import SettingsModal from "../modal/SettingsModal.vue";
import routes from "../router/routes";

const linksList: EssentialLinkProps[] = routes.filter(route => "name" in route).map(route => {
  return {
    title: route.name as string,
    icon: (route.meta && "icon" in route.meta ? route.meta.icon : '') as string,
    link: route.path
  }
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
