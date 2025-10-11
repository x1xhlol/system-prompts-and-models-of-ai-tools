<script lang="ts" setup>
import { useData } from '../composables/data'
import VPSocialLinks from './VPSocialLinks.vue'

const { theme } = useData()
</script>

<template>
  <VPSocialLinks
    v-if="theme.socialLinks"
    class="VPNavScreenSocialLinks"
    :links="theme.socialLinks"
  />
</template>
