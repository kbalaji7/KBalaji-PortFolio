import { Text, useCursor, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { FOOTER_LINKS } from "../../constants";
import { FooterLink } from "../../types";

const FooterLinkItem = ({ link }: { link: FooterLink }) => {
  const textRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const isConfigured = Boolean(link.url);
  const shouldShowTooltip = Boolean(link.hoverText);
  const onPointerOver = () => { if (isConfigured) setHovered(true); };
  const onPointerOut = () => setHovered(false);
  const onClick = () => {
    if (!link.url) return;
    if (link.url.startsWith('mailto:') || link.url.startsWith('tel:')) {
      window.location.href = link.url;
      return;
    }
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };
  const onPointerMove = (e: MouseEvent) => {
    if (isMobile || !isConfigured || !shouldShowTooltip) return;
    const hoverDiv = document.getElementById(`footer-link-${link.name}`);
    gsap.to(hoverDiv, {
      top: `${e.clientY + 14}px`,
      left: `${e.clientX}px`,
      duration: 0.6,
    });
  };

  const fontProps = {
    font: "./Vercetti-Regular.woff",
    fontSize: 0.2,
    color: 'white',
    onPointerOver,
    onPointerMove,
    onPointerOut,
    onClick,
  };

  useEffect(() => {
    if (isConfigured && shouldShowTooltip && !document.getElementById(`footer-link-${link.name}`)) {
      const hoverDiv = document.createElement('div');
      hoverDiv.id = `footer-link-${link.name}`;
      hoverDiv.textContent = link.hoverText ?? link.name.toUpperCase();
      hoverDiv.style.position = 'fixed';
      hoverDiv.style.zIndex = '2';
      hoverDiv.style.bottom = '0';
      hoverDiv.style.opacity = '0';
      hoverDiv.style.left = window.innerWidth / 2 + 'px';
      hoverDiv.style.fontSize = '0.8rem';
      hoverDiv.style.pointerEvents = 'none';
      document.body.appendChild(hoverDiv);
    }
    return () => {
      document.getElementById(`footer-link-${link.name}`)?.remove();
    };
  }, [isConfigured, link.hoverText, link.name, shouldShowTooltip])

  useEffect(() => {
    if (isMobile || !isConfigured) return

    const hoverDiv = document.getElementById(`footer-link-${link.name}`);

    if (hovered && shouldShowTooltip) {
      gsap.fromTo(hoverDiv, { opacity: 0 }, { opacity: 0.5, delay: 0.2 });
    } else if (shouldShowTooltip) {
      gsap.to(hoverDiv, { opacity: 0 });
    }

    gsap.to(textRef.current, {
      letterSpacing: hovered ? 0.3 : 0,
      duration: 0.3,
    });

    return () => {
      gsap.killTweensOf(hoverDiv);
      gsap.killTweensOf(textRef.current);
    }
  }, [hovered, isConfigured, link.name, shouldShowTooltip]);

  useCursor(hovered && isConfigured);

  return (
    <Text ref={textRef} {...fontProps} fontSize={isMobile ? 0.15 : 0.2} color={isConfigured ? 'white' : '#86a9bd'}>
      {link.name.toUpperCase()}
    </Text>
  )
}

const Footer = () => {
  const groupRef = useRef<THREE.Group>(null);
  const data = useScroll();

  useFrame(() => {
    const d = data.range(0.8, 0.2);
    if (groupRef.current) {
      groupRef.current.visible = d > 0;
    }
  });

  const getLinks = () => {
    return FOOTER_LINKS.map((link, i) => {
      return (
        <group key={link.name} position={[i * (isMobile ? 1.1 : 2), 0, 0]}>
          <FooterLinkItem link={link}/>
        </group>
      );
    });
  };

  return (
    <group position={[0, -44, 18]} rotation={[-Math.PI / 2, 0, 0]} ref={groupRef}>
      <group position={[isMobile ? -2.25 : -4, 0, 0]}>
        { getLinks() }
      </group>
    </group>
  );
};

export default Footer;
