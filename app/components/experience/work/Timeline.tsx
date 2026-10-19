import { Box, Edges, Line, Text, TextProps } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { usePortalStore } from "@stores";
import gsap from "gsap";
import { useEffect, useMemo, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";

import { WORK_TIMELINE } from "@constants";
import { WorkTimelinePoint } from "@types";

const reusableLeft = new THREE.Vector3(-0.3, 0, -0.1);
const reusableRight = new THREE.Vector3(0.3, 0, -0.1);

// CatmullRomCurve3 reaches its interior control points at roughly one quarter,
// one half, and three quarters of the scroll path. Matching the card hand-offs
// to those locations prevents a new card from appearing before the camera has
// reached its marker. The final card enters just before the end so it can still
// animate into view.
const STAGE_STARTS = [0, 0.25, 0.5, 0.74, 0.94];

const getStageIndex = (progress: number) => {
  for (let index = STAGE_STARTS.length - 1; index >= 0; index -= 1) {
    if (progress >= STAGE_STARTS[index]) return index;
  }
  return 0;
};

const DetailCard = ({ details, visibleCount, compact = false }: { details: NonNullable<WorkTimelinePoint['details']>, visibleCount?: number, compact?: boolean }) => {
  const visibleDetails = visibleCount === undefined ? details : details.slice(0, visibleCount);
  const content = compact
    ? visibleDetails.map((detail) => detail.text).join('\n')
    : visibleDetails.map((detail) => `${detail.label ? `${detail.label}\n` : ''}${detail.text}`).join('\n\n');
  const textHeight = visibleDetails.reduce((height, detail) => {
    const labelLines = detail.label ? 1 : 0;
    return height + labelLines + Math.ceil(detail.text.length / 44) + 1;
  }, 0);
  const height = compact ? Math.max(1.35, visibleDetails.length * 0.5 + 0.5) : Math.max(1.8, textHeight * 0.27 + 0.45);

  return (
    <group position={[0, -1.35 - height / 2, 0.08]}>
      <mesh>
        <planeGeometry args={[4.4, height, 1]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
        <Edges color="white" lineWidth={1} />
      </mesh>
      <Text
        font="./Vercetti-Regular.woff"
        color="white"
        anchorX="left"
        anchorY="top"
        position={[-1.95, height / 2 - 0.24, 0.05]}
        maxWidth={3.9}
        fontSize={0.23}
        lineHeight={1.35}>
        {content}
      </Text>
    </group>
  );
};

const PlainDetails = ({ details, positionY, compact = false }: { details: NonNullable<WorkTimelinePoint['details']>, positionY: number, compact?: boolean }) => (
  <Text
    font="./Vercetti-Regular.woff"
    color="white"
    anchorX="left"
    anchorY="top"
    position={[compact ? 0 : -1.95, positionY, 0.1]}
    maxWidth={compact ? 5.5 : 3.95}
    fontSize={compact ? 0.19 : 0.25}
    lineHeight={compact ? 1.55 : 1.5}>
    {details.map((detail) => detail.text).join('\n')}
  </Text>
);

const TimelinePoint = ({ point, diff, noEntryAnim = false }: { point: WorkTimelinePoint, diff: number, noEntryAnim?: boolean }) => {
  const getPoint = useMemo(() => {
    switch (point.position) {
      case 'left': return reusableLeft;
      case 'right': return reusableRight;
      default: return new THREE.Vector3();
    }
  }, [point.position]);

  const textAlign = point.position === 'left' ? 'right' : 'left';
  const isTechnicalSkills = point.title === 'TECHNICAL SKILLS';
  const isEducation = point.title === 'ACS COLLEGE OF ENGINEERING';
  const isLiving = point.title === 'Living...';
  // Career stages use a small date-to-title gap and a tighter title-to-role
  // gap. The skills stage is aligned directly with its marker instead.
  const contentBaseY = isTechnicalSkills ? 0 : isEducation ? -0.52 : isLiving ? -0.62 : -0.66;
  const subtitleY = isTechnicalSkills ? -0.62 : isLiving ? -0.615 : -0.56;
  const titleFontSize = isLiving ? 0.72 : isEducation ? 0.36 : point.title.length > 21 ? 0.42 : point.title.length > 18 ? 0.46 : 0.52;
  const yearLineRef = useRef<THREE.Group>(null);
  const titleLineRef = useRef<THREE.Group>(null);
  const subtitleLineRef = useRef<THREE.Group>(null);
  const detailLineRef = useRef<THREE.Group>(null);

  const textProps: Partial<TextProps> = useMemo(() => ({
    font: "./Vercetti-Regular.woff",
    color: "white",
    anchorX: textAlign,
    fillOpacity: 2 - 2 * diff,
  }), [textAlign, diff]);

  const titleProps = useMemo(() => ({
    ...textProps,
    font: "./soria-font.ttf",
    fontSize: titleFontSize,
    maxWidth: isEducation ? 5.9 : isTechnicalSkills ? 5.5 : isLiving ? 6.5 : 4.8,
    lineHeight: isLiving ? 1.0 : 1.14,
  }), [isEducation, isTechnicalSkills, isLiving, textProps, titleFontSize]);

  useEffect(() => {
    // Skip the slide-in animation for cards that are exiting (going behind the screen)
    if (noEntryAnim) return;

    const rows = [
      point.year ? yearLineRef.current : null,
      titleLineRef.current,
      point.subtitle ? subtitleLineRef.current : null,
      point.details ? detailLineRef.current : null,
    ].filter((row): row is THREE.Group => row !== null);
    const animation = gsap.timeline();

    rows.forEach((row, index) => {
      row.position.y = -0.72;
      row.scale.setScalar(0.88);
      animation
        .to(row.position, { y: 0, duration: 0.42, ease: 'power3.out' }, index * 0.15)
        .to(row.scale, { x: 1, y: 1, z: 1, duration: 0.42, ease: 'power3.out' }, index * 0.15);
    });

    return () => {
      animation.kill();
    };
  }, [point.details, point.subtitle, point.title, point.year, noEntryAnim]);

  return (
    <group position={point.point} scale={isMobile ? 0.35 : 0.6}>
      <Box args={[0.2, 0.2, 0.2]} position={[0, 0, -0.1]} scale={[1 - diff, 1 - diff, 1 - diff]}>
        <meshBasicMaterial color="white" wireframe />
        <Edges color="white" lineWidth={1.5} />
      </Box>
      <group>
        <group position={getPoint}>
          {point.year && <group ref={yearLineRef}>
            <Text {...textProps} fontSize={isLiving ? 0.22 : 0.3} position={[-diff / 2, 0, 0]}>
              {point.year}
            </Text>
          </group>}
          <group position={[0, contentBaseY, 0]}>
            <group ref={titleLineRef}>
              <Text {...titleProps} position={[0, -diff / 2, 0]}>
                {point.title}
              </Text>
            </group>
            {point.subtitle && <group ref={subtitleLineRef}>
              <Text {...textProps} fontSize={isTechnicalSkills ? 0.19 : isEducation ? 0.2 : isLiving ? 0.21 : 0.24} lineHeight={isTechnicalSkills ? 1.55 : 1.45} maxWidth={isTechnicalSkills || isEducation ? 5.9 : isLiving ? 6.5 : 4.8} position={[0, subtitleY - diff, 0]}>
                {point.subtitle}
              </Text>
            </group>}
            {point.details && <group ref={detailLineRef}>
              {point.detailsStyle === 'plain'
                ? <PlainDetails details={point.details} positionY={subtitleY - 0.347} compact={isTechnicalSkills} />
                : <DetailCard details={point.details} />}
            </group>}
          </group>
        </group>
      </group>
    </group>
  );
};

const Timeline = ({ progress }: { progress: number }) => {
  const { camera } = useThree();
  const isActive = usePortalStore((state) => state.activePortalId === 'work');
  const timeline = useMemo(() => WORK_TIMELINE, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(timeline.map(p => p.point), false), [timeline]);
  const curvePoints = useMemo(() => curve.getPoints(500), [curve]);
  const visibleCurvePoints = useMemo(() => curvePoints.slice(0, Math.max(1, Math.ceil(progress * curvePoints.length))), [curvePoints, progress]);
  const activeStageIndex = getStageIndex(progress);
  const activeTimelinePoint = timeline[activeStageIndex];

  // Keep the outgoing card in its real world position while the camera moves
  // to the next marker. This is the same depth-led exit used by the reference
  // timeline: it recedes behind the camera rather than blinking away.
  const stageEnd = STAGE_STARTS[activeStageIndex + 1] ?? 1;
  const stageLength = Math.max(stageEnd - STAGE_STARTS[activeStageIndex], Number.EPSILON);
  const segmentProgress = THREE.MathUtils.clamp((progress - STAGE_STARTS[activeStageIndex]) / stageLength, 0, 1);
  const prevIndex = activeStageIndex - 1;
  const prevTimelinePoint = prevIndex >= 0 ? timeline[prevIndex] : null;

  const [visibleDashedCurvePoints, setVisibleDashedCurvePoints] = useState<THREE.Vector3[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useFrame((_, delta) => {
    if (isActive) {
      const position = curve.getPoint(progress);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, (isMobile ? -1 : -2) + position.x, 4, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, -39 + position.z, 4, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, 13 - position.y, 4, delta);
    }
  });

  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    if (groupRef.current) {
      tl.to(groupRef.current.scale, {
        x: isActive ? 1 : 0,
        y: isActive ? 1 : 0,
        z: isActive ? 1 : 0,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      });
      tl.to(groupRef.current.position, {
        y: isActive ? 0 : -2,
        duration: 1,
        delay: isActive ? 0.4 : 0,
      }, 0);
    }

    if (isActive) {
      let i = 0;
      clearInterval(intervalRef.current!);
      setTimeout(() => {
        intervalRef.current = setInterval(() => {
          const p = i++ / 100;
          setVisibleDashedCurvePoints(curvePoints.slice(0, Math.max(1, Math.ceil(p * curvePoints.length))));
          if (i > 100 && intervalRef.current) clearInterval(intervalRef.current);
        }, 10);
      }, 1000);
    } else {
      // Reset alongside interval cleanup; this state mirrors the timer.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleDashedCurvePoints([]);
      clearInterval(intervalRef.current!);
    }

    return () => clearInterval(intervalRef.current!);
  }, [isActive]);

  return (
    <group position={[0, -0.1, -0.1]}>
      <Line points={visibleCurvePoints} color="white" lineWidth={3} />
      {visibleDashedCurvePoints.length > 0 && (
        <Line
          points={visibleDashedCurvePoints}
          color="white"
          lineWidth={0.5}
          dashed
          dashSize={0.25}
          gapSize={0.25}
        />
      )}
      <group ref={groupRef}>
        {/* Previous card stays at its 3D world position and fades/recedes as the camera moves forward */}
        {prevTimelinePoint && (
          <TimelinePoint
            point={prevTimelinePoint}
            key={`exiting-${prevTimelinePoint.title}`}
            diff={segmentProgress}
            noEntryAnim
          />
        )}
        {/* Active (incoming) card — entry animation plays normally */}
        <TimelinePoint point={activeTimelinePoint} key={activeTimelinePoint.title} diff={0} />
      </group>
    </group>
  );
};

export default Timeline;
