<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row q-mb-md q-gutter-sm">
        <q-input
          v-model="searchQuery.username"
          label="Search Username"
          outlined
          dense
          clearable
          @keyup.enter="performSearch"
        />
        <q-input
          v-model="searchQuery.nickname"
          label="Search Nickname"
          outlined
          dense
          clearable
          @keyup.enter="performSearch"
        />
        <q-select
            v-model="searchQuery.gender"
            :options="genderSearchOptions"
            label="Gender"
            outlined
            dense
            emit-value
            map-options
            clearable
            style="min-width: 150px;"
        />
        <q-btn label="Search" color="primary" @click="performSearch" icon="search" />
        <q-btn label="Create User" color="positive" @click="navigateToCreate" icon="add" />
      </div>

      <q-table
        title="Users"
        :rows="userList"
        :columns="columns"
        row-key="id"
        :loading="isLoading"
        v-model:pagination="pagination"
        @request="handleTableRequest"
        binary-state-sort
        :rows-per-page-options="[5, 10, 20, 50]"
      >
        <template v-slot:body-cell-enabled="props">
          <q-td :props="props">
            <q-badge :color="props.value ? 'green' : 'red'">
              {{ props.value ? 'Yes' : 'No' }}
            </q-badge>
          </q-td>
        </template>
        <template v-slot:body-cell-locked="props">
          <q-td :props="props">
            <q-badge :color="props.value ? 'orange' : 'green'">
              {{ props.value ? 'Yes' : 'No' }}
            </q-badge>
          </q-td>
        </template>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" @click="navigateToEdit(props.row.id)" color="primary" />
            <q-btn flat round dense icon="delete" @click="confirmDeleteUser(props.row.id, props.row.username)" color="negative" />
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUserStore } from '@/store/modules/UserStore';
import type { UserQueryRequest, UserVO } from '@/models/UserModels';
import type { QueryRequest } from '@/models/ApiModel';
import type { QTableProps } from 'quasar';

const userStore = useUserStore();
const router = useRouter();
const $q = useQuasar();

const userList = computed(() => userStore.users);
const isLoading = computed(() => userStore.isLoadingUsers);

const searchQuery = ref<UserQueryRequest>({
  username: '',
  nickname: '',
  gender: undefined, // Initialize as undefined for q-select clearable
});

const genderSearchOptions = [
  { label: 'All', value: undefined },
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Unknown', value: 'UNKNOWN' },
];


const columns: QTableProps['columns'] = [
  { name: 'username', required: true, label: 'Username', align: 'left', field: (row: UserVO) => row.username, sortable: true },
  { name: 'nickname', label: 'Nickname', align: 'left', field: (row: UserVO) => row.nickname, sortable: true },
  { name: 'gender', label: 'Gender', align: 'left', field: (row: UserVO) => row.gender, sortable: true },
  { name: 'enabled', label: 'Enabled', align: 'center', field: (row: UserVO) => row.enabled, sortable: true },
  { name: 'locked', label: 'Locked', align: 'center', field: (row: UserVO) => row.locked, sortable: true },
  { name: 'lastLoginTime', label: 'Last Login', align: 'left', field: (row: UserVO) => row.lastLoginTime ? new Date(row.lastLoginTime).toLocaleString() : 'N/A', sortable: true },
  { name: 'createdTime', label: 'Created Time', align: 'left', field: (row: UserVO) => new Date(row.createdTime!).toLocaleString(), sortable: true },
  { name: 'actions', label: 'Actions', align: 'center', field: 'id' },
];

const pagination = ref({
  sortBy: 'username',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0, // This will be updated by the store's totalUsers
});

watch(() => userStore.totalUsers, (newTotal) => {
  pagination.value.rowsNumber = newTotal;
});

const fetchUsers = async (pageInfo?: { page: number, rowsPerPage: number, sortBy?: string, descending?: boolean }) => {
  const pageNum = pageInfo?.page || pagination.value.page;
  const pageSize = pageInfo?.rowsPerPage || pagination.value.rowsPerPage;
  
  // Basic sort mapping, can be expanded
  // let sortField = pageInfo?.sortBy || pagination.value.sortBy;
  // let sortOrder = (pageInfo?.descending ?? pagination.value.descending) ? 'DESC' : 'ASC';
  // Add sorting to queryParams if API supports it
  
  const query: QueryRequest<UserQueryRequest> = {
    pageNum,
    pageSize,
    queryParams: { ...searchQuery.value }, 
    // Add sorting params here, e.g. sortField, sortOrder
  };

  try {
    await userStore.searchUsers(query);
    // Pagination rowsNumber is updated by watch on userStore.totalUsers
    // Update local pagination state to match what was requested/returned
    pagination.value.page = pageNum;
    pagination.value.rowsPerPage = pageSize;
    if(pageInfo?.sortBy) pagination.value.sortBy = pageInfo.sortBy;
    if(pageInfo?.descending !== undefined) pagination.value.descending = pageInfo.descending;

  } catch (error: any) {
    $q.notify({
      color: 'negative',
      message: `Failed to load users: ${error.message || 'Unknown error'}`,
      icon: 'error',
    });
  }
};

const performSearch = () => {
  pagination.value.page = 1; // Reset to first page for new search
  fetchUsers();
};

const handleTableRequest: QTableProps['onRequest'] = (requestProp) => {
  const { page, rowsPerPage, sortBy, descending } = requestProp.pagination;
  fetchUsers({ page, rowsPerPage, sortBy, descending });
};


onMounted(() => {
  fetchUsers(); // Initial fetch
});

const navigateToCreate = () => {
  router.push({ name: 'UserCreate' });
};

const navigateToEdit = (id?: number) => {
  if (id === undefined) {
    $q.notify({ color: 'negative', message: 'User ID is undefined.'});
    return;
  }
  router.push({ name: 'UserEdit', params: { id: id.toString() } });
};

const confirmDeleteUser = (id?: number, username?: string) => {
  if (id === undefined) {
     $q.notify({ color: 'negative', message: 'User ID is undefined for delete.'});
    return;
  }
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete user "${username || 'this user'}"? This action cannot be undone.`,
    cancel: true,
    persistent: true, // User must explicitly choose an action
    ok: {
      label: 'Delete',
      color: 'negative',
    }
  }).onOk(async () => {
    try {
      await userStore.deleteUser(id.toString());
      $q.notify({
        color: 'positive',
        message: `User "${username || ''}" deleted successfully.`,
        icon: 'check_circle',
      });
      // Refresh table, potentially staying on current page if items remain
      // or going to previous page if current page becomes empty
      if (userStore.users.length === 0 && pagination.value.page > 1) {
        pagination.value.page--;
      }
      fetchUsers();
    } catch (error: any) {
      $q.notify({
        color: 'negative',
        message: `Failed to delete user: ${error.message || 'Unknown error'}`,
        icon: 'error',
      });
    }
  });
};
</script>

<style scoped>
.q-table__title {
  font-size: 1.5rem; /* Example: Make title larger */
}
/* Add any other custom styles */
</style>
