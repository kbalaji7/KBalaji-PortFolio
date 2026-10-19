export type ProjectAction = 'live' | 'github' | 'video';

export interface Project {
  id: string;
  title: string;
  label: string;
  description: string;
  technologies?: string[];
  thumbnail?: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  videoUrl: string | null;
  primaryAction: ProjectAction;
}
