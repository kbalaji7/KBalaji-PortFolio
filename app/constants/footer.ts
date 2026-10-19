import { FooterLink } from '../types';
import { PROFILE } from './profile';

export const FOOTER_LINKS: FooterLink[] = [
  { name: 'Email', hoverText: PROFILE.email, icon: 'icons/email.svg', url: `mailto:${PROFILE.email}` },
  { name: 'GitHub', icon: 'icons/github.svg', url: PROFILE.social.githubUrl },
  { name: 'Instagram', icon: 'icons/instagram.svg', url: PROFILE.social.instagramUrl },
  { name: 'Resume', hoverText: 'Open K Balaji résumé', icon: 'icons/file.svg', url: PROFILE.resumeUrl },
  { name: 'LinkedIn', icon: 'icons/linkedin.svg', url: PROFILE.social.linkedinUrl },
];
