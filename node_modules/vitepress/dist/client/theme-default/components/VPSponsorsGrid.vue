<script setup lang="ts">
import type { GridSize } from '../composables/sponsor-grid'
import { ref } from 'vue'
import { useSponsorsGrid } from '../composables/sponsor-grid'

export interface Sponsor {
  name: string
  img: string
  url: string
}
interface Props {
  size?: GridSize
  data: Sponsor[]
}
const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const el = ref(null)

useSponsorsGrid({ el, size: props.size })
</script>

<template>
  <div class="VPSponsorsGrid vp-sponsor-grid" :class="[size]" ref="el">
    <div
      v-for="sponsor in data"
      :key="sponsor.name"
      class="vp-sponsor-grid-item"
    >
      <a
        class="vp-sponsor-grid-link"
        :href="sponsor.url"
        target="_blank"
        rel="sponsored noopener"
      >
        <article class="vp-sponsor-grid-box">
          <h4 class="visually-hidden">{{ sponsor.name }}</h4>
          <img
            class="vp-sponsor-grid-image"
            :src="sponsor.img"
            :alt="sponsor.name"
          />
        </article>
      </a>
    </div>
  </div>
</template>
