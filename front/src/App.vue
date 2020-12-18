<template>
  <main :style="{ backgroundColor:'#F7F8FA' }">
    <vault-header />

    <router-view />
  </main>
</template>

<script>
import VaultHeader from "@/components/VaultHeader";

export default {
  name: "App",
  components: { VaultHeader }
};
</script>