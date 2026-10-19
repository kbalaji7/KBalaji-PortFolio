import { Edges, Text, TextProps } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import * as THREE from 'three';

import { CertificationBlock } from '../../../constants/certifications';
import { usePortalStore } from '@stores';
import {
  CAROUSEL_CARD_HEIGHT,
  CAROUSEL_CARD_TEXT_LEFT,
  CAROUSEL_CARD_TEXT_WIDTH,
  CAROUSEL_CARD_WIDTH,
} from './cardLayout';

interface CertificateTileProps {
  block: CertificationBlock;
  position: [number, number, number];
  rotation: [number, number, number];
  index: number;
  tileId: string;
  focusedTile: string | null;
  onFocus: (tileId: string | null) => void;
  datePosition: 'top' | 'bottom';
}

const estimateLineCount = (text: string, charactersPerLine: number) => {
  return text.split('\n').reduce((total, line) => {
    if (!line) return total + 1;
    let lineCount = 1;
    let lineLength = 0;
    line.split(/\s+/).forEach((word) => {
      const wordLength = word.length;
      if (lineLength > 0 && lineLength + wordLength + 1 > charactersPerLine) {
        lineCount += 1;
        lineLength = wordLength;
      } else {
        lineLength += (lineLength > 0 ? 1 : 0) + wordLength;
      }
    });
    return total + lineCount;
  }, 0);
};

const CertificateTile = ({
  block,
  position,
  rotation,
  index,
  tileId,
  focusedTile,
  onFocus,
  datePosition,
}: CertificateTileProps) => {
  const tileRef = useRef<THREE.Group>(null);
  const entranceRef = useRef<THREE.Group>(null);
  const certificateRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Mesh>(null);
  const cardMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const labelRef = useRef<THREE.Group>(null);
  const labelTextRef = useRef<THREE.Mesh>(null);
  const titleRef = useRef<THREE.Mesh>(null);
  const previewRef = useRef<THREE.Mesh>(null);
  const detailsRef = useRef<THREE.Mesh>(null);
  const hoverAnimRef = useRef<gsap.core.Timeline | null>(null);
  const [desktopHovered, setDesktopHovered] = useState(false);
  const isProjectSectionActive = usePortalStore((state) => state.activePortalId === 'projects');
  const hovered = isMobile ? focusedTile === tileId : desktopHovered;
  const focused = focusedTile === tileId;
  const isOtherFocused = focusedTile !== null && !focused;
  const expanded = hovered && !isOtherFocused;
  const labelY = datePosition === 'top' ? 1.14 : -1.14;
  const expandedProjectY = datePosition === 'top' ? 0.82 : -0.82;
  const preview = useMemo(
    () => block.entries.map((entry, entryIndex) => {
      const [title] = entry.split(' — ');
      return `${String(entryIndex + 1).padStart(2, '0')}  ${title}`;
    }).join('\n'),
    [block.entries],
  );
  const entries = useMemo(
    () => block.entries.map((entry, entryIndex) => `${String(entryIndex + 1).padStart(2, '0')}  ${entry}`).join('\n\n'),
    [block.entries],
  );
  const titleLineCount = 1;
  const detailLineCount = useMemo(() => estimateLineCount(entries, 32), [entries]);
  const hoverTitleY = 1.26;
  const hoverDetailsY = hoverTitleY - titleLineCount * 0.42 - 0.28;
  const expandedScale = Math.min(3.2, Math.max(2.6, (Math.abs(hoverDetailsY) + detailLineCount * 0.28 + 0.5) / (CAROUSEL_CARD_HEIGHT / 2)));
  const collapsedTitleY = 0.72;
  const collapsedPreviewY = 0.28;
  const titleProps = useMemo(() => ({
    font: './soria-font.ttf', color: 'black', anchorX: 'left' as const, anchorY: 'top' as const,
  }), []);
  const bodyProps: Partial<TextProps> = useMemo(() => ({
    font: './Vercetti-Regular.woff', color: 'black', anchorX: 'left', anchorY: 'top',
  }), []);

  useEffect(() => {
    if (!certificateRef.current || !cardRef.current || !cardMaterialRef.current || !labelRef.current || !titleRef.current || !previewRef.current || !detailsRef.current) return;
    hoverAnimRef.current?.kill();
    const animation = gsap.timeline()
      .to(certificateRef.current.position, { y: expanded ? expandedProjectY : 0, z: 0, duration: 0.38, ease: 'power3.out' }, 0)
      .to(cardRef.current.scale, { y: expanded ? expandedScale : 1, duration: 0.38, ease: 'power3.out' }, 0)
      .to(cardMaterialRef.current, { opacity: expanded ? 0.38 : 0.2, duration: 0.3 }, 0)
      .to(labelRef.current.position, { y: expanded ? 2.02 : labelY, duration: 0.36, ease: 'power3.out' }, 0)
      .to(titleRef.current.position, { y: expanded ? hoverTitleY : collapsedTitleY, duration: 0.36, ease: 'power3.out' }, 0)
      .to(previewRef.current, { fillOpacity: expanded || isOtherFocused ? 0 : 1, duration: 0.14 }, 0)
      .to(detailsRef.current.position, { y: expanded ? hoverDetailsY : collapsedPreviewY, duration: 0.36, ease: 'power3.out' }, 0)
      .to(detailsRef.current, { fillOpacity: expanded ? 1 : 0, duration: 0.22, delay: expanded ? 0.14 : 0 }, 0);
    hoverAnimRef.current = animation;
    return () => {
      animation.kill();
    };
  }, [expanded, expandedProjectY, expandedScale, hoverDetailsY, isOtherFocused, labelY]);

  useEffect(() => {
    if (!tileRef.current) return;
    gsap.to(tileRef.current.scale, {
      x: isOtherFocused ? 0.7 : 1,
      y: isOtherFocused ? 0.7 : 1,
      z: isOtherFocused ? 0.7 : 1,
      duration: 0.45,
      ease: 'power3.inOut',
    });
    gsap.to(tileRef.current.position, {
      x: position[0],
      y: position[1] + (isOtherFocused ? -0.9 : 0),
      z: position[2],
      duration: 0.45,
      ease: 'power3.inOut',
    });
  }, [isOtherFocused, position]);

  useEffect(() => {
    if (!titleRef.current || !labelTextRef.current) return;
    gsap.to([titleRef.current, labelTextRef.current], {
      fillOpacity: isOtherFocused ? 0 : 1,
      duration: 0.18,
      ease: 'power2.out',
    });
  }, [isOtherFocused]);

  useEffect(() => {
    if (!entranceRef.current) return;
    gsap.to(entranceRef.current.position, {
      y: isProjectSectionActive ? 0 : -11,
      duration: 0.7,
      delay: isProjectSectionActive ? index * 0.08 : 0,
      ease: 'power2.out',
    });
  }, [index, isProjectSectionActive]);

  const handlePointerOver = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!isMobile && isProjectSectionActive) {
      setDesktopHovered(true);
      onFocus(tileId);
    }
  };

  return (
    <group
      ref={tileRef}
      position={position}
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={() => {
        if (!isMobile && isProjectSectionActive) {
          setDesktopHovered(false);
          onFocus(null);
        }
      }}>
      <group ref={entranceRef}>
        <group ref={certificateRef}>
          <mesh ref={cardRef}>
            <planeGeometry args={[CAROUSEL_CARD_WIDTH, CAROUSEL_CARD_HEIGHT, 1]} />
            <meshBasicMaterial ref={cardMaterialRef} color="#fff" transparent opacity={0.2} side={THREE.DoubleSide} />
            <Edges color="#0b0b0b" lineWidth={1} />
          </mesh>

          <Text
            ref={titleRef}
            {...titleProps}
            position={[CAROUSEL_CARD_TEXT_LEFT, collapsedTitleY, 0.11]}
            maxWidth={CAROUSEL_CARD_TEXT_WIDTH}
            fontSize={0.26}
            lineHeight={1.1}
            fillOpacity={1}>
            {block.title}
          </Text>

          <group ref={labelRef} position={[-1.08, labelY, 0.02]}>
            <mesh>
              <planeGeometry args={[1.5, 0.38, 1]} />
              <meshBasicMaterial color="#777" opacity={0} wireframe />
              <Edges color="black" lineWidth={1} />
            </mesh>
            <Text ref={labelTextRef} {...bodyProps} position={[-0.62, 0.18, 0]} fontSize={0.2} fillOpacity={1}>
              {datePosition === 'top' ? '01' : '02'}
            </Text>
          </group>

          <Text
            ref={previewRef}
            {...bodyProps}
            position={[CAROUSEL_CARD_TEXT_LEFT, collapsedPreviewY, 0.12]}
            maxWidth={CAROUSEL_CARD_TEXT_WIDTH}
            fontSize={0.135}
            lineHeight={1.28}
            fillOpacity={1}>
            {preview}
          </Text>

          <Text
            ref={detailsRef}
            {...bodyProps}
            position={[CAROUSEL_CARD_TEXT_LEFT, collapsedPreviewY, 0.12]}
            maxWidth={CAROUSEL_CARD_TEXT_WIDTH}
            fontSize={0.175}
            lineHeight={1.36}
            fillOpacity={0}>
            {entries}
          </Text>
        </group>
      </group>
    </group>
  );
};

export default CertificateTile;
