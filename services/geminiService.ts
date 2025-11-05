import { GoogleGenAI } from "@google/genai";

// Usaremos un patrón de singleton inicializado de forma perezosa.
// Esto evita que la aplicación se bloquee al inicio si falta la clave de API.
let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;

  // Si falta la clave de API, lanza un error específico y fácil de usar.
  // Esto será capturado por nuestros componentes y mostrado en la interfaz de usuario.
  if (!apiKey) {
    throw new Error(
      "VITE_API_KEY no está configurada. Por favor, vaya a la configuración de su proyecto en Vercel, añada esta variable de entorno con su clave de API de Google y vuelva a desplegar la aplicación."
    );
  }
  
  // Inicializa el cliente solo una vez.
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  
  return ai;
};

const model = 'gemini-2.5-flash';

export interface Category {
    id: number;
    name: string;
}

export interface Cause {
    id: number;
    text: string;
}

export const generateFiveWhysAnalysis = async (problem: string): Promise<string> => {
  const prompt = `
    Actúa como un experto consultor en resolución de problemas y análisis de causa raíz. Tu tarea es guiar a un usuario a través de la metodología de los "5 Porqués" de manera automática.

    **Problema Inicial Proporcionado por el Usuario:**
    ${problem}

    **Tu Tarea:**
    Basado en el problema inicial, realiza un análisis completo y estructurado en español. Tu respuesta DEBE seguir este formato Markdown exacto:

    1.  **Análisis de los 5 Porqués:** Genera una cadena lógica y plausible de 5 preguntas de "Por qué" y sus respuestas correspondientes. Cada porqué debe profundizar en la causa del anterior.
        *   **1. ¿Por qué...?** (Genera la primera pregunta basada en el problema)
            *   *Respuesta:* (Genera una respuesta plausible)
        *   **2. ¿Por qué...?** (Genera la segunda pregunta basada en la respuesta anterior)
            *   *Respuesta:* (Genera una respuesta plausible)
        *   ... y así sucesivamente hasta el quinto porqué.

    2.  **Identificación de la Causa Raíz:** Después de los 5 porqués, declara explícitamente la causa raíz fundamental que has descubierto. Esta debe ser la respuesta al quinto porqué.

    3.  **Sugerencias y Plan de Acción:** Propón de 2 a 3 contramedidas o acciones concretas y accionables para abordar la causa raíz identificada. Las sugerencias deben ser prácticas y específicas.

    Asegúrate de que que el análisis sea coherente, lógico y útil para resolver el problema original.
  `;

  try {
    const generativeModel = getAiClient(); // Obtiene o crea el cliente de IA.
    const response = await generativeModel.models.generateContent({
        model: model,
        contents: prompt
    });
    // La respuesta de Gemini a veces envuelve la salida en bloques de código markdown.
    // Vamos a limpiarlo para una mejor representación.
    let text = response.text;
    if (text.startsWith("```markdown")) {
        text = text.substring(10, text.length - 3).trim();
    } else if (text.startsWith("```")) {
        text = text.substring(3, text.length - 3).trim();
    }
    return text;
  } catch (error) {
    console.error("Error en generateFiveWhysAnalysis:", error);
    // Vuelve a lanzar el error para que el componente pueda capturarlo y mostrar el mensaje específico.
    throw error;
  }
};


export const analyzeIshikawa = async (
    problem: string,
    categories: Category[],
    causes: Record<number, Cause[]>
): Promise<string> => {
    const formattedIshikawaData = categories.map(category => {
        const categoryCauses = causes[category.id] || [];
        if (categoryCauses.length === 0) return null;
        return `**Categoría: ${category.name}**\n${categoryCauses.map(c => `- ${c.text}`).join('\n')}`;
    }).filter(Boolean).join('\n\n');

    const prompt = `
      Actúa como un consultor experto en optimización de procesos y control de calidad para la industria manufacturera, con especial conocimiento en la producción de empaques de cartón a partir de material reciclado.

      Estás analizando un problema para la empresa "Empacor", ubicada en Bogotá, Colombia.

      **Problema Identificado:**
      ${problem}

      **Análisis de Causa y Efecto (Diagrama de Ishikawa) proporcionado por el equipo:**
      ${formattedIshikawaData}

      **Tu Tarea:**
      Con base en este análisis, y considerando el contexto específico de Empacor (producción de cajas de cartón reciclado en Bogotá, Colombia), realiza lo siguiente en español:

      1. **Identificación de Causas Raíz Probables:** Revisa todas las causas listadas y identifica de 2 a 4 que parezcan ser las más influyentes o fundamentales. Justifica brevemente por qué estas son las más críticas en el contexto de la producción de cajas.

      2. **Plan de Mejora Detallado:** Genera **al menos 5 planes de mejora** concretos y accionables para Empacor. Cada plan debe ser un punto numerado y debe incluir claramente los siguientes subtítulos en negrita:
         - **Acción Específica:** ¿Qué se debe hacer exactamente?
         - **Responsable Sugerido:** ¿Qué departamento o rol debería liderar la iniciativa (ej. Jefe de Producción, Gerente de Calidad, Mantenimiento, Jefe de Logística)?
         - **Recursos Potenciales:** ¿Qué se podría necesitar (ej. capacitación, nuevo equipo, ajuste de software, cambio de proveedor, presupuesto para mantenimiento)?
         - **Métrica de Éxito (KPI):** ¿Cómo se medirá el éxito de la acción (ej. Reducción del X% en defectos, Aumento del Y% en OEE, Disminución de quejas de clientes en Z%)?
    `;

    try {
        const generativeModel = getAiClient(); // Obtiene o crea el cliente de IA.
        const response = await generativeModel.models.generateContent({
            model: model,
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error en analyzeIshikawa:", error);
        // Vuelve a lanzar el error para que el componente pueda capturarlo y mostrar el mensaje específico.
        throw error;
    }
};
