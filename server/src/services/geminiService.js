const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'AIzaSyDje00t6DcqonGiCKWjfsbyFgqBZidcyD8' });

class GeminiService {
  static async generateSummary(plantel, ceap, fases) {
    const phasesData = fases.map(f => 
      `- ${f.fase_nombre}: Estado: ${f.estado}, Avance Global: ${f.porcentaje || 0}%, Captura: ${f.avance_captura || 0}%, Verificación: ${f.avance_verificacion || 0}%. Notas/Observaciones: ${f.observaciones || 'Ninguna'}. Estimada: ${f.fecha_estimada || 'Sin fecha'}`
    ).join('\n');

    const prompt = `Actúa como un analista experto de gestión de proyectos.
Genera un resumen ejecutivo claro y conciso del avance del plantel ${plantel.nombre} (${plantel.codigo}) para el ciclo CEAP ${ceap.ciclo_inicio}-${ceap.ciclo_fin}.
El avance global del proyecto es ${ceap.porcentaje_avance || 0}%.

Aquí están los datos duros por cada fase de implementación:
${phasesData}

El resumen debe resaltar el progreso general, las fases con bajo avance o retrasadas, los cuellos de botella basados en las observaciones y los siguientes pasos lógicos. Por favor usa un tono profesional y un formato fácil de leer en un par de párrafos cortos. No incluyas saludo ni explicaciones innecesarias, ve directo al grano.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating summary with Gemini:', error);
      throw new Error('Error al generar resumen ejecutivo');
    }
  }
}

module.exports = GeminiService;
