export interface CertificationBlock {
  id: string;
  title: string;
  entries: string[];
}

export const CERTIFICATION_BLOCKS: CertificationBlock[] = [
  {
    id: 'certifications-one',
    title: 'CERTIFICATIONS',
    entries: [
      'Oracle Certified Foundations Associate — Oracle University (2025).',
      'AI-900 & AI-102 Microsoft Certified: Azure AI Fundamentals.',
      'EY and Microsoft — AI Skills Passport Certification.',
    ],
  },
  {
    id: 'certifications-two',
    title: 'CERTIFICATIONS',
    entries: [
      'Green Skills and Artificial Intelligence — Edunet Foundation Skills4Future Program.',
      'MERN Stack Web Application — Acadoemor.',
      'Research Paper Published — Biometric Payment System through Microsoft CMT, focusing on secure and seamless authentication for digital transactions.',
    ],
  },
];
