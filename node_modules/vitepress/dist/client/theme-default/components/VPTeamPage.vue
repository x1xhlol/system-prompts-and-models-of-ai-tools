<template>
  <div class="VPTeamPage">
    <slot />
  </div>
</template>

<style scoped>
.VPTeamPage {
  margin: 96px 0;
}

@media (min-width: 768px) {
  .VPTeamPage {
    margin: 128px 0;
  }
}

.VPHome :slotted(.VPTeamPageTitle) {
  border-top: 1px solid var(--vp-c-gutter);
  padding-top: 88px !important;
}

:slotted(.VPTeamPageSection + .VPTeamPageSection),
:slotted(.VPTeamMembers + .VPTeamPageSection) {
  margin-top: 64px;
}

:slotted(.VPTeamMembers + .VPTeamMembers) {
  margin-top: 24px;
}

@media (min-width: 768px) {
  :slotted(.VPTeamPageTitle + .VPTeamPageSection) {
    margin-top: 16px;
  }

  :slotted(.VPTeamPageSection + .VPTeamPageSection),
  :slotted(.VPTeamMembers + .VPTeamPageSection) {
    margin-top: 96px;
  }
}

:slotted(.VPTeamMembers) {
  padding: 0 24px;
}

@media (min-width: 768px) {
  :slotted(.VPTeamMembers) {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  :slotted(.VPTeamMembers) {
    padding: 0 64px;
  }
}
</style>
