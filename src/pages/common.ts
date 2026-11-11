import type { Status, Tone } from '../types';

export const profNome = (profMap: any, id: string | null) => (id && profMap[id] ? profMap[id].nome : 'Sem professor');

export const OPCOES: { s: Status; label: string; icon: string; tone: Tone }[] = [
  { s: 'P', label: 'Presente', icon: 'check', tone: 'ok' },
  { s: 'A', label: 'Ausente', icon: 'x', tone: 'bad' },
  { s: 'J', label: 'Justificado', icon: 'note', tone: 'info' }
];
