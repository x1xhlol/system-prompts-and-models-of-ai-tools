<template>
  <div class="VPTeamPageTitle">
    <h1 v-if="$slots.title" class="title">
      <slot name="title" />
    </h1>
    <p v-if="$slots.lead" class="lead">
      <slot name="lead" />
    </p>
  </div>
</template>

<style scoped>
.VPTeamPageTitle {
  padding: 48px 32px;
  text-align: center;
}

@media (min-width: 768px) {
  .VPTeamPageTitle {
    padding: 64px 48px 48px;
  }
}

@media (min-width: 960px) {
  .VPTeamPageTitle {
    padding: 80px 64px 48px;
  }
}

.title {
  letter-spacing: 0;
  line-height: 44px;
  font-size: 36px;
  font-weight: 500;
}

@media (min-width: 768px) {
  .title {
    letter-spacing: -0.5px;
    line-height: 56px;
    font-size: 48px;
  }
}

.lead {
  margin: 0 auto;
  max-width: 512px;
  padding-top: 12px;
  line-height: 24px;
  font-size: 16px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

@media (min-width: 768px) {
  .lead {
    max-width: 592px;
    letter-spacing: 0.15px;
    line-height: 28px;
    font-size: 20px;
  }
}
</style>
