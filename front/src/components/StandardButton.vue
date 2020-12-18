<template>
  <button type="button" class="btn btn-primary" @click="onClick">
    {{ title }}
  </button>
</template>

<script>
export default {
  name: "StandardButton",

  props: {
    title: {
      type: String,
      default: () => ""
    }
  },

  methods: {
    onClick() {
      this.$emit("click" + this.title);
    }
  }
};
</script>
