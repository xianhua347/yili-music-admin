<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>原力音乐</q-toolbar-title>
        <q-space />
        <q-chip :clickable="false" size="13px">
          <q-avatar color="secondary" text-color="white" rounded size="30px">
            <img
              v-if="
                currentUser?.avatar !== undefined &&
                currentUser?.avatar.trim().length >= 1
              "
              :src="currentUser?.avatar"
              alt="img"
            />
            <span v-else>{{ userInitials }}</span>
          </q-avatar>
          {{ currentUser?.username }}
        </q-chip>
        <dark-mode-toggle />
        <!-- 设置图标 -->
        <q-btn :icon="mdiCog" dense flat round ripple>
          <!-- 添加一个弹出菜单 -->
          <q-menu auto-close>
            <!-- 菜单列表 -->
            <q-list>
              <!--退出菜单项 -->
              <q-item
                v-ripple
                clickable
                @click="
                  async () => {
                    await tokenStore.logout();
                  }
                "
              >
                <q-item-section> 退出登录 </q-item-section>
              </q-item>
              <!--修改密码菜单项 -->
              <q-item v-ripple clickable @click="showModal = true">
                <q-item-section>修改密码</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>
    <change-password v-model="showModal" />
    <q-drawer v-model="leftDrawerOpen" show-if-above side="left" bordered>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { mdiCog } from '@mdi/js';
import { storeToRefs } from 'pinia';
import { computed, ComputedRef, onMounted, Ref, ref } from 'vue';

import { ChangePassword, DarkModeToggle } from '@/components';
import { useTokenStore, useUserStore } from '@/store';

const userStore = useUserStore();
const tokenStore = useTokenStore();
const { currentUser } = storeToRefs(userStore);

const showModal: Ref<boolean> = ref(false);
const leftDrawerOpen: Ref<boolean> = ref(false);
/* function */
onMounted(() => {
  userStore.fetchCurrentUser();
});

const userInitials: ComputedRef<string | undefined> = computed(() => {
  return currentUser.value?.username
    .split(' ')
    .map((word) => word[0])
    .join('');
});
const toggleLeftDrawer = (): void => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
</script>
<style scoped></style>
