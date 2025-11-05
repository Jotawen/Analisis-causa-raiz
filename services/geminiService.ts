import { GoogleGenAI } from "@google/genai";

// FIX: Use import.meta.env.VITE_API_KEY to access environment variables
// on the client-side with Vite, which resolves the app crash (black screen).
// The environment variable in your deployment service (Vercel) must be named VITE_API_KEY.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const model = 'gemini-2.5-flash';

interface Why {
  id: number;
  answer: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface Cause {
    id: number;
    text: string;
}

export const analyzeRootCause = async (problem: string, whys: Why[]): Promise<string> => {
  const formattedWhys = whys
    .map((why, index) => `Por qué ${index + 1}: ${why.answer}`)
    .join('\n');

  const prompt = `
    Actúa como un experto consultor en resolución de problemas y análisis de causa raíz utilizando la metodología de los "5 Porqués".
    A continuación, te presento un análisis realizado por un usuario.

    **Problema Inicial:**
    ${problem}

    **Cadena de los 5 Porqués y sus Respuestas:**
    ${formattedWhys}

    **Tu Tarea:**
    Basándote estrictamente en la información proporcionada, realiza las siguientes tres acciones en español y formatea tu respuesta claramente:

    1. **Resumen del Análisis:** Describe brevemente la secuencia de eventos o la cadena causal que llevó desde la causa más superficial hasta la causa raíz identificada en la respuesta al quinto porqué.
    
    2. **Validación de la Causa Raíz:** Evalúa si la respuesta al quinto porqué parece ser una causa raíz fundamental (generalmente relacionada con un proceso, sistema o decisión humana) en lugar de un simple síntoma. Ofrece una breve justificación.

    3. **Sugerencias y Pasos Siguientes:** Propón 2 o 3 contramedidas o acciones concretas que podrían tomarse para abordar la causa raíz identificada y prevenir la recurrencia del problema.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from Gemini API.");
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
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis from Gemini API.");
    }
};
