import { useEffect, useMemo, useState } from "react";
import ProjectTile from "./ProjectTile";
import CertificateTile from './CertificateTile';

import { CERTIFICATION_BLOCKS, PROJECTS } from "@constants";
import { usePortalStore } from "@stores";
import {
  CAROUSEL_BOTTOM_ROW_Y,
  CAROUSEL_DISTANCE,
  CAROUSEL_TOP_ROW_Y,
} from './cardLayout';

const ProjectsCarousel = () => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [focusedTile, setFocusedTile] = useState<string | null>(null);
  const isActive = usePortalStore((state) => state.activePortalId === "projects");
  const activeId = isActive ? selectedId : null;

  const onClick = (id: number) => {
    setSelectedId(id === selectedId ? null : id);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isActive) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedId((current) => current === null ? 0 : (current + 1) % PROJECTS.length);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedId((current) => current === null ? PROJECTS.length - 1 : (current - 1 + PROJECTS.length) % PROJECTS.length);
      }
      if (event.key === 'Enter' && selectedId !== null) {
        const project = PROJECTS[selectedId];
        const destination = project.primaryAction === 'live'
          ? project.liveUrl
          : project.primaryAction === 'github'
            ? project.githubUrl
            : project.videoUrl;
        if (destination) window.open(destination, '_blank', 'noopener,noreferrer');
      }
      if (event.key === 'Escape' && selectedId !== null) {
        event.preventDefault();
        setSelectedId(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, selectedId]);
  const tiles = useMemo(() => {
    const fov = Math.PI;
    const columns = Math.ceil(PROJECTS.length / 2) + 1;

    return PROJECTS.map((project, i) => {
      const row = i % 2; // 0 or 1
      const column = Math.floor(i / 2);

      const angle = (fov / columns) * column;

      const z = -CAROUSEL_DISTANCE * Math.sin(angle);
      const x = -CAROUSEL_DISTANCE * Math.cos(angle);

      const rotY = Math.PI / 2 - angle;

      // vertical stacking
      const y = row === 0 ? CAROUSEL_TOP_ROW_Y : CAROUSEL_BOTTOM_ROW_Y;
      const datePosition = row === 0 ? 'top' : 'bottom';
      return (
        <ProjectTile
          key={i}
          datePosition={datePosition}
          project={project}
          index={i}
          position={[x, y, z]}
          rotation={[0, rotY, 0]}
          activeId={activeId}
          selectedId={selectedId}
          tileId={`project-${i}`}
          focusedTile={focusedTile}
          onFocus={setFocusedTile}
          onClick={() => onClick(i)}
        />
      );
    });
  }, [activeId, isActive]);

  const certificationPlacement = useMemo(() => {
    // Certifications are the next column in the same curved run as projects,
    // instead of using fixed world coordinates that drift away as projects grow.
    const columns = Math.ceil(PROJECTS.length / 2) + 1;
    const angle = (Math.PI / columns) * (columns - 1);

    return {
      position: [
        -CAROUSEL_DISTANCE * Math.cos(angle),
        CAROUSEL_TOP_ROW_Y,
        -CAROUSEL_DISTANCE * Math.sin(angle),
      ] as [number, number, number],
      rotation: [0, Math.PI / 2 - angle, 0] as [number, number, number],
    };
  }, []);

  return (
    <group rotation={[0, -Math.PI / 12, 0]}>
      {tiles}
      <CertificateTile
        block={CERTIFICATION_BLOCKS[0]}
        position={certificationPlacement.position}
        rotation={certificationPlacement.rotation}
        datePosition="top"
        index={PROJECTS.length}
        tileId="certificate-1"
        focusedTile={focusedTile}
        onFocus={setFocusedTile}
      />
      <CertificateTile
        block={CERTIFICATION_BLOCKS[1]}
        position={[
          certificationPlacement.position[0],
          CAROUSEL_BOTTOM_ROW_Y,
          certificationPlacement.position[2],
        ]}
        rotation={certificationPlacement.rotation}
        datePosition="bottom"
        index={PROJECTS.length + 1}
        tileId="certificate-2"
        focusedTile={focusedTile}
        onFocus={setFocusedTile}
      />
    </group>
  );
};

export default ProjectsCarousel;
