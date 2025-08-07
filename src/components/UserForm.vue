<template>
  <q-form @submit="onSubmit" class="q-gutter-md">
    <q-input
      filled
      v-model="formData.username"
      label="Username *"
      :readonly="isEditMode"
      lazy-rules
      :rules="[ val => val && val.length > 0 || 'Please type something']"
    />

    <q-input
      v-if="!isEditMode"
      filled
      type="password"
      v-model="formData.password"
      label="Password *"
      lazy-rules
      :rules="[
        val => val && val.length > 0 || 'Please type a password',
        // Add more password strength rules if needed
      ]"
    />
     <!-- Optional: Password change section for edit mode -->
    <q-input
      v-if="isEditMode && showPasswordFieldForEdit"
      filled
      type="password"
      v-model="formData.password"
      label="New Password (leave blank to keep current)"
      lazy-rules
    />


    <q-input
      filled
      v-model="formData.nickname"
      label="Nickname"
      lazy-rules
    />

    <q-select
      filled
      v-model="formData.gender"
      :options="genderOptions"
      label="Gender"
      emit-value
      map-options
    />

    <div v-if="isEditMode && canAdminister">
      <q-toggle
        v-model="formData.locked"
        label="Locked"
        left-label
      />
      <q-toggle
        v-model="formData.enabled"
        label="Enabled"
        left-label
      />
      <q-select
        filled
        v-model="formData.roles"
        multiple
        :options="roleOptions"
        use-chips
        stack-label
        label="Roles"
        emit-value
        map-options
        hint="Select roles for the user. Only visible to admins."
        v-if="canAdminister"
      />
    </div>
     <!-- For profile edit where user is not admin but isEditMode is true -->
     <div v-if="isEditMode && !canAdminister">
        <p><strong>Roles:</strong> {{ formData.roles?.join(', ') || 'No roles assigned' }}</p>
        <!-- Other fields like locked/enabled could be shown as readonly if needed -->
    </div>


    <div>
      <q-btn :label="isEditMode ? 'Update' : 'Create'" type="submit" color="primary"/>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted, computed } from 'vue';
import type { UserVO, UserCreateDTO, UserUpdateDTO } from '@/models/UserModels';
import { useUserStore } from '@/store/modules/UserStore'; // To check if current user is admin

type FormDataType = Partial<UserVO & UserCreateDTO & UserUpdateDTO>;

const props = defineProps<{
  user: FormDataType | null; // Allow Partial for create mode
  isEditMode: boolean;
  // Optional prop to control if admin fields are shown, could also be derived from store
  // showAdminFields?: boolean; 
}>();

const emit = defineEmits<{
  (e: 'submit', data: FormDataType): void;
}>();

const userStore = useUserStore();
const canAdminister = computed(() => userStore.isAdmin());
const showPasswordFieldForEdit = ref(false); // Control visibility of password field in edit mode

const genderOptions = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Unknown', value: 'UNKNOWN' },
];

const allPossibleRoles = ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR']; // Example roles
const roleOptions = computed(() => allPossibleRoles.map(role => ({ label: role, value: role })));


const initialFormData = (): FormDataType => ({
  username: '',
  password: '',
  nickname: '',
  gender: 'UNKNOWN',
  locked: false,
  enabled: true,
  roles: [],
});

const formData = ref<FormDataType>(initialFormData());

watch(() => props.user,
  (newUser) => {
    if (newUser && Object.keys(newUser).length > 0) {
      // Create a new object to avoid reactivity issues with props
      formData.value = { ...initialFormData(), ...newUser };
      // Ensure roles is always an array, even if undefined in newUser
      formData.value.roles = newUser.roles ? [...newUser.roles] : [];
    } else {
      formData.value = initialFormData();
    }
    // Reset password field for edit mode unless explicitly shown
    if (props.isEditMode) {
        formData.value.password = ''; 
    }
  },
  { immediate: true, deep: true }
);

// This onMounted might be redundant if watch handles initialization correctly
onMounted(() => {
  if (props.user && Object.keys(props.user).length > 0) {
    formData.value = { ...initialFormData(), ...props.user };
    formData.value.roles = props.user.roles ? [...props.user.roles] : [];
  } else {
     formData.value = initialFormData();
  }
   if (props.isEditMode) {
        formData.value.password = ''; 
    }
});


const onSubmit = () => {
  const dataToSubmit: FormDataType = { ...formData.value };

  if (props.isEditMode) {
    // Do not send password on update unless it's being changed and field is visible
    if (!dataToSubmit.password || dataToSubmit.password.trim() === '') {
        delete dataToSubmit.password;
    }
    // Username typically cannot be changed, ensure it's not part of DTO if backend rejects
    // delete dataToSubmit.username; // This might be too aggressive if UserUpdateDTO allows it.
                                  // For now, rely on backend to ignore if not changeable.
  } else {
    // For create, password is required
    if (!dataToSubmit.password || dataToSubmit.password.trim() === '') {
        // This should be caught by q-input rules, but as a fallback:
        console.error("Password is required for new user.");
        // Optionally use Quasar notify here
        return; 
    }
  }

  // Ensure roles are only submitted if user is admin or if it's create mode (where roles might be default)
  if (!canAdminister.value && props.isEditMode) {
      delete dataToSubmit.roles;
      delete dataToSubmit.locked;
      delete dataToSubmit.enabled;
  }
  
  emit('submit', dataToSubmit);
};
</script>

<style scoped>
/* Add any specific styling if needed */
.q-form {
  max-width: 600px; /* Or adjust as needed */
  margin: auto; /* Center form on page if used standalone */
}
.q-gutter-md > * {
    margin-bottom: 16px; /* Ensure spacing between Quasar components */
}
</style>
