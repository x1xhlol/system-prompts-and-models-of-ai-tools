import './styles/vars.css';
import './styles/base.css';
import './styles/icons.css';
import './styles/utils.css';
import './styles/components/custom-block.css';
import './styles/components/vp-code.css';
import './styles/components/vp-code-group.css';
import './styles/components/vp-doc.css';
import './styles/components/vp-sponsor.css';
import VPBadge from './components/VPBadge.vue';
import Layout from './Layout.vue';
export { default as VPBadge } from './components/VPBadge.vue';
export { default as VPButton } from './components/VPButton.vue';
export { default as VPDocAsideSponsors } from './components/VPDocAsideSponsors.vue';
export { default as VPFeatures } from './components/VPFeatures.vue';
export { default as VPHomeContent } from './components/VPHomeContent.vue';
export { default as VPHomeFeatures } from './components/VPHomeFeatures.vue';
export { default as VPHomeHero } from './components/VPHomeHero.vue';
export { default as VPHomeSponsors } from './components/VPHomeSponsors.vue';
export { default as VPImage } from './components/VPImage.vue';
export { default as VPLink } from './components/VPLink.vue';
export { default as VPNavBarSearch } from './components/VPNavBarSearch.vue';
export { default as VPSocialLink } from './components/VPSocialLink.vue';
export { default as VPSocialLinks } from './components/VPSocialLinks.vue';
export { default as VPSponsors } from './components/VPSponsors.vue';
export { default as VPTeamMembers } from './components/VPTeamMembers.vue';
export { default as VPTeamPage } from './components/VPTeamPage.vue';
export { default as VPTeamPageSection } from './components/VPTeamPageSection.vue';
export { default as VPTeamPageTitle } from './components/VPTeamPageTitle.vue';
export { useLocalNav } from './composables/local-nav';
export { useSidebar } from './composables/sidebar';
const theme = {
    Layout,
    enhanceApp: ({ app }) => {
        app.component('Badge', VPBadge);
    }
};
export default theme;
