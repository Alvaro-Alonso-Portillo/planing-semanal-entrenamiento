import { Exercise } from '../../domain/entities/Exercise';

export const seedExercises: Exercise[] = [
  // --- GIMNASIO: EMPUJE (Sin apoyo de pie / Carga ligera) ---
  {
    id: 1,
    name: 'Press de Pecho Sentado en Máquina',
    category: 'Empuje',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },
  {
    id: 2,
    name: 'Press Militar Sentado con Mancuernas',
    category: 'Empuje',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'media',
  },
  {
    id: 3,
    name: 'Extensiones de Tríceps en Polea Alta (Sentado/De Rodillas)',
    category: 'Empuje',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },
  {
    id: 4,
    name: 'Aperturas de Pecho con Mancuernas en Banco Plano',
    category: 'Empuje',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },
  {
    id: 5,
    name: 'Flexiones de Pecho de Rodillas',
    category: 'Empuje',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'media',
  },

  // --- GIMNASIO: EMPUJE (Requiere apoyo de pie - Para excluir) ---
  {
    id: 6,
    name: 'Sentadilla con Barra',
    category: 'Empuje',
    style: null,
    requiresFootSupport: true,
    cardiacIntensity: 'media',
  },
  {
    id: 7,
    name: 'Press Militar de Pie con Barra',
    category: 'Empuje',
    style: null,
    requiresFootSupport: true,
    cardiacIntensity: 'media',
  },

  // --- GIMNASIO: TIRÓN (Sin apoyo de pie / Carga ligera) ---
  {
    id: 8,
    name: 'Jalón al Pecho en Polea Alta',
    category: 'Tirón',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },
  {
    id: 9,
    name: 'Remo Gironda (Sentado en polea baja)',
    category: 'Tirón',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'media',
  },
  {
    id: 10,
    name: 'Curl de Bíceps en Banco Scott con Barra Z',
    category: 'Tirón',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },
  {
    id: 11,
    name: 'Curl de Bíceps Alterno en Banco Inclinado',
    category: 'Tirón',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },
  {
    id: 12,
    name: 'Pájaros con Mancuerna Sentado (Posterior hombro)',
    category: 'Tirón',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },

  // --- GIMNASIO: TIRÓN (Requiere apoyo de pie - Para excluir) ---
  {
    id: 13,
    name: 'Peso Muerto Convencional',
    category: 'Tirón',
    style: null,
    requiresFootSupport: true,
    cardiacIntensity: 'media',
  },

  // --- GIMNASIO: CORE (Sin apoyo de pie) ---
  {
    id: 14,
    name: 'Crunch Abdominal en Esterilla',
    category: 'Core',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },
  {
    id: 15,
    name: 'Elevaciones de Piernas Tumbado',
    category: 'Core',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },
  {
    id: 16,
    name: 'Plancha Abdominal sobre Antebrazos (Apoyo de rodillas)',
    category: 'Core',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'media',
  },
  {
    id: 17,
    name: 'Rueda Abdominal (Ab Wheel) de Rodillas',
    category: 'Core',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'media',
  },
  {
    id: 18,
    name: 'Giros Rusos (Russian Twists) con Pies en el Aire',
    category: 'Core',
    style: null,
    requiresFootSupport: false,
    cardiacIntensity: 'media',
  },

  // --- NATACIÓN (Diferentes Estilos) ---
  {
    id: 19,
    name: 'Nado Crol',
    category: 'Natación',
    style: 'Crol',
    requiresFootSupport: false,
    cardiacIntensity: 'media',
  },
  {
    id: 20,
    name: 'Nado Espalda',
    category: 'Natación',
    style: 'Espalda',
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },
  {
    id: 21,
    name: 'Nado Braza',
    category: 'Natación',
    style: 'Braza',
    requiresFootSupport: false,
    cardiacIntensity: 'baja',
  },
];
