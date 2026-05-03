
export async function generateResponse(prompt: string, model: string = process.env.OLLAMA_MODEL || 'llama3'): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
  
  try {
    const response = await $fetch<{ response: string }>(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      body: {
        model: model,
        prompt: prompt,
        stream: false
      }
    });
    return response.response;
  } catch (error) {
    console.error('Error communicating with Ollama:', error);
    throw new Error('Failed to generate response from Ollama');
  }
}
