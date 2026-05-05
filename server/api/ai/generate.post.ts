import { generateResponse } from '../../utils/ollama';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { prompt, model } = body;

  if (!prompt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Prompt is required',
    });
  }

  try {
    const response = await generateResponse(prompt, model);
    return { response };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate response from Ollama',
    });
  }
});
