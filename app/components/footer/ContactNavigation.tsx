'use client';

import { FOOTER_LINKS } from '@constants';

const ContactNavigation = () => (
  <nav className="contact-navigation" aria-label="Contact and social links">
    {FOOTER_LINKS.map((link) => {
      if (!link.url) {
        return <span key={link.name} aria-disabled="true">{link.name}: link coming soon</span>;
      }

      const isDirectContact = link.url.startsWith('mailto:') || link.url.startsWith('tel:');
      return (
        <a
          key={link.name}
          href={link.url}
          target={isDirectContact ? undefined : '_blank'}
          rel={isDirectContact ? undefined : 'noreferrer'}>
          {link.name}
        </a>
      );
    })}
  </nav>
);

export default ContactNavigation;
