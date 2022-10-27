<template>
  <HelloWorld :msg="msg"></HelloWorld>
</template>

<script>
import { defineComponent } from "vue"
export default defineComponent({
  name: "Home",
  setup() {
    return {
      msg: "hello World",
    }
  }
})
</script>