<script lang="ts" setup>
import { useData } from '../composables/data'
import VPSwitchAppearance from './VPSwitchAppearance.vue'

const { site } = useData()
</script>

<template>
  <div
    v-if="
      site.appearance &&
      site.appearance !== 'force-dark' &&
      site.appearance !== 'force-auto'
    "
    class="VPNavBarAppearance"
  >
    <VPSwitchAppearance />
  </div>
</template>

<style scoped>
.VPNavBarAppearance {
  display: none;
}

@media (min-width: 1280px) {
  .VPNavBarAppearance {
    display: flex;
    align-items: center;
  }
}
</style>
