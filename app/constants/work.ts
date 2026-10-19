import * as THREE from 'three';

import { WorkTimelinePoint } from '../types';

export const WORK_TIMELINE: WorkTimelinePoint[] = [
  {
    point: new THREE.Vector3(0, 0, 0), year: '2022–2026', title: 'ACS COLLEGE OF ENGINEERING', subtitle: 'B.E. IN COMPUTER SCIENCE ENGINEERING', position: 'right',
  },
  {
    point: new THREE.Vector3(-4, -4, -4), year: 'JAN 2025–JUN 2025', title: 'MINDCLOUDZ INNOVATION', subtitle: 'SOFTWARE DEVELOPER INTERN', position: 'left',
  },
  {
    point: new THREE.Vector3(-3, -1, -8), year: 'DEC 2025–MAY 2026', title: 'MINDMATRIX.IO', subtitle: 'ANDROID APP DEVELOPMENT INTERN', position: 'left',
  },
  {
    point: new THREE.Vector3(1, 1, -10.5), year: '', title: 'TECHNICAL SKILLS', subtitle: 'PROGRAMMING LANGUAGES\nDATA & ANALYTICS · DATABASES', position: 'right',
    details: [
      { text: 'AI / ML TOOLS · CLOUD & DEVOPS · WEB DEVELOPMENT' },
    ],
    detailsStyle: 'plain',
  },
  { point: new THREE.Vector3(1, 2.75, -14.5), year: '2026', title: 'Living...', subtitle: '↓ 288K tokens', position: 'right' },
];
