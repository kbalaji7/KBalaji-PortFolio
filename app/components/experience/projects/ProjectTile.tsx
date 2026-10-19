import { Edges, Text, TextProps } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import * as THREE from 'three';

import { usePortalStore } from '@stores';
import { Project } from '@types';
import {
  CAROUSEL_CARD_HEIGHT,
  CAROUSEL_CARD_TEXT_LEFT,
  CAROUSEL_CARD_TEXT_WIDTH,
  CAROUSEL_CARD_WIDTH,
} from './cardLayout';

interface ProjectTileProps {
  project: Project;
  index: number;
  position: [number, number, number];
  rotation: [number, number, number];
  activeId: number | null;
  selectedId: number | null;
  tileId: string;
  focusedTile: string | null;
  onFocus: (tileId: string | null) => void;
  onClick: () => void;
  datePosition: 'top' | 'bottom';
}

const estimateLineCount = (text: string, charactersPerLine: number) => {
  let lineCount = 1;
  let lineLength = 0;

  text.split(/\s+/).forEach((word) => {
    const wordLength = word.length;
    if (lineLength > 0 && lineLength + wordLength + 1 > charactersPerLine) {
      lineCount += 1;
      lineLength = wordLength;
    } else {
      lineLength += (lineLength > 0 ? 1 : 0) + wordLength;
    }
  });

  return lineCount;
};

const ProjectTile = ({ project, index, position, rotation, activeId, selectedId, tileId, focusedTile, onFocus, onClick, datePosition }: ProjectTileProps) => {
  const tileRef = useRef<THREE.Group>(null);
  const entranceRef = useRef<THREE.Group>(null);
  const projectRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Mesh>(null);
  const cardMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const labelRef = useRef<THREE.Group>(null);
  const labelTextRef = useRef<THREE.Mesh>(null);
  const titleRef = useRef<THREE.Mesh>(null);
  const detailsRef = useRef<THREE.Mesh>(null);
  const actionRef = useRef<THREE.Group>(null);
  const hoverAnimRef = useRef<gsap.core.Timeline | null>(null);
  const [desktopHovered, setDesktopHovered] = useState(false);
  const isProjectSectionActive = usePortalStore((state) => state.activePortalId === 'projects');
  const hovered = (isMobile ? activeId === index : desktopHovered) || activeId === index;
  const selected = selectedId === index;
  const focused = focusedTile === tileId;
  const isOtherFocused = focusedTile !== null && !focused;
  const expanded = hovered && !isOtherFocused;
  const destination = project.primaryAction === 'live'
    ? project.liveUrl
    : project.primaryAction === 'github'
      ? project.githubUrl
      : project.videoUrl;
  const hasDestination = Boolean(destination);
  const labelY = datePosition === 'top' ? 1.14 : -1.14;
  const expandedProjectY = datePosition === 'top' ? 0.82 : -0.82;
  const detailText = project.description;
  const titleLineCount = useMemo(() => estimateLineCount(project.title, 17), [project.title]);
  const detailLineCount = useMemo(() => estimateLineCount(detailText, 34), [detailText]);
  const hoverTitleY = 1.26;
  // Measure the copy before placing it so every expanded card keeps the same
  // visual breathing room between title, description, and action.
  const hoverDetailsY = hoverTitleY - titleLineCount * 0.5 - 0.42;
  const hoverActionY = hoverDetailsY - detailLineCount * 0.28 - 0.46;
  const expandedScale = Math.min(3.2, Math.max(2.6, (Math.abs(hoverActionY) + 0.4) / (CAROUSEL_CARD_HEIGHT / 2)));

  const titleProps = useMemo(() => ({
    font: './soria-font.ttf', color: 'black', anchorX: 'left' as const, anchorY: 'top' as const,
  }), []);
  const bodyProps: Partial<TextProps> = useMemo(() => ({
    font: './Vercetti-Regular.woff', color: 'black', anchorX: 'left', anchorY: 'top',
  }), []);

  useEffect(() => {
    if (!projectRef.current || !cardRef.current || !cardMaterialRef.current || !labelRef.current || !titleRef.current || !detailsRef.current || !actionRef.current) return;
    hoverAnimRef.current?.kill();
    const animation = gsap.timeline()
      .to(projectRef.current.position, { y: expanded ? expandedProjectY : 0, z: expanded ? 1 : 0, duration: 0.38, ease: 'power3.out' }, 0)
      .to(cardRef.current.scale, { y: expanded ? expandedScale : 1, duration: 0.38, ease: 'power3.out' }, 0)
      .to(cardMaterialRef.current, { opacity: expanded ? 0.38 : 0.2, duration: 0.3 }, 0)
      .to(labelRef.current.position, { y: expanded ? 2.02 : labelY, duration: 0.36, ease: 'power3.out' }, 0)
      .to(titleRef.current.position, { y: expanded ? hoverTitleY : 0.68, duration: 0.36, ease: 'power3.out' }, 0)
      .to(detailsRef.current.position, { y: expanded ? hoverDetailsY : 0.3, duration: 0.36, ease: 'power3.out' }, 0)
      .to(detailsRef.current, { fillOpacity: expanded ? 1 : 0, duration: 0.22, delay: expanded ? 0.12 : 0 }, 0)
      .to(actionRef.current.scale, { x: expanded ? 1 : 0, y: expanded ? 1 : 0, duration: 0.24, delay: expanded ? 0.16 : 0, ease: 'power3.out' }, 0)
      .to(actionRef.current.position, { y: expanded ? hoverActionY : -0.96, z: expanded ? 0.3 : -1, duration: 0.25 }, 0);
    hoverAnimRef.current = animation;
    return () => {
      animation.kill();
    };
  }, [expanded, expandedProjectY, expandedScale, hoverActionY, hoverDetailsY, labelY]);

  useEffect(() => {
    if (!tileRef.current) return;
    const isOtherCard = isOtherFocused || (focusedTile === null && selectedId !== null && !selected);
    gsap.to(tileRef.current.scale, {
      x: focused || selected ? 1.08 : isOtherCard ? 0.7 : 1,
      y: focused || selected ? 1.08 : isOtherCard ? 0.7 : 1,
      z: focused || selected ? 1.08 : isOtherCard ? 0.7 : 1,
      duration: 0.45,
      ease: 'power3.inOut',
    });
    gsap.to(tileRef.current.position, {
      x: position[0],
      y: position[1] + (isOtherCard ? -0.9 : 0),
      z: position[2] + (focused || selected ? 2.6 : isOtherCard ? -0.8 : 0),
      duration: 0.45,
      ease: 'power3.inOut',
    });
  }, [focused, focusedTile, isOtherFocused, position, selected, selectedId]);

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
  }, [isProjectSectionActive, index]);

  const handleAction = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!destination || !actionRef.current) return;
    const actionPosition = actionRef.current.position;
    gsap.to(actionPosition, { z: 0, duration: 0.1 })
      .then(() => gsap.to(actionPosition, { z: 0.3, duration: 0.2 }));
    window.open(destination, '_blank', 'noopener,noreferrer');
  };

  const handlePointerOver = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!isMobile && isProjectSectionActive) {
      setDesktopHovered(true);
      onFocus(tileId);
    }
  };

  return (
    <group ref={tileRef} position={position} rotation={rotation} onClick={onClick} onPointerOver={handlePointerOver}
      onPointerOut={() => {
        if (!isMobile && isProjectSectionActive) {
          setDesktopHovered(false);
          onFocus(null);
        }
      }}>
      <group ref={entranceRef}>
        <group ref={projectRef}>
        <mesh ref={cardRef}>
          <planeGeometry args={[CAROUSEL_CARD_WIDTH, CAROUSEL_CARD_HEIGHT, 1]} />
          <meshBasicMaterial ref={cardMaterialRef} color="#fff" transparent opacity={0.2} side={THREE.DoubleSide} />
          <Edges color="#0b0b0b" lineWidth={1} />
        </mesh>

        <Text ref={titleRef} {...titleProps} position={[CAROUSEL_CARD_TEXT_LEFT, 0.68, 0.11]} maxWidth={CAROUSEL_CARD_TEXT_WIDTH} fontSize={0.42} lineHeight={1.13} fillOpacity={1}>
          {project.title}
        </Text>

        <group ref={labelRef} position={[-1.08, labelY, 0.02]}>
          <mesh>
            <planeGeometry args={[1.5, 0.38, 1]} />
            <meshBasicMaterial color="#777" opacity={0} wireframe />
            <Edges color="black" lineWidth={1} />
          </mesh>
          <Text ref={labelTextRef} {...bodyProps} position={[-0.62, 0.18, 0]} fontSize={0.2} fillOpacity={1}>{project.label}</Text>
        </group>

        <Text ref={detailsRef} {...bodyProps} position={[CAROUSEL_CARD_TEXT_LEFT, 0.3, 0.12]} maxWidth={CAROUSEL_CARD_TEXT_WIDTH} fontSize={0.2} lineHeight={1.32} fillOpacity={0}>
          {detailText}
        </Text>

        <group ref={actionRef} position={[0.9, -0.96, -1]} scale={[0, 0, 1]} onClick={handleAction}
          onPointerOver={() => { if (hasDestination) document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}>
          <mesh>
            <boxGeometry args={[1.42, 0.44, 0.2]} />
            <meshBasicMaterial color="#fff" transparent opacity={0.72} />
            <Edges color="black" lineWidth={1} />
          </mesh>
          <Text {...bodyProps} color="black" position={[-0.57, 0.13, 0.2]} fontSize={0.17} fillOpacity={1}>
            {hasDestination ? 'VIEW ↗' : 'COMING SOON'}
          </Text>
        </group>
      </group>
      </group>
    </group>
  );
};

export default ProjectTile;
