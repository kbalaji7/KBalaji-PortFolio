import * as THREE from "three";

export interface WorkTimelinePoint {
  point: THREE.Vector3,
  year: string,
  title: string,
  subtitle?: string,
  position: 'left' | 'right',
  details?: Array<{
    label?: string,
    text: string,
  }>,
  detailsStyle?: 'panel' | 'plain',
}
