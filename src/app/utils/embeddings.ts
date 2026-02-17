
import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export async function getEmbeddings(input: string) {
  try {
    // @ts-ignore - dimensions parameter is supported by OpenAI API but not in openai-edge types
    const response = await openai.createEmbedding({
      model: "text-embedding-3-small",
      input: input.replace(/\n/g, ' '),
      dimensions: 512 // Match Pinecone index dimension
    } as any)

    const result = await response.json();

    // Check if the response has the expected structure
    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
      console.error("Invalid OpenAI API response:", result);
      throw new Error(`Invalid response from OpenAI API: ${JSON.stringify(result)}`);
    }

    return result.data[0].embedding as number[]

  } catch (e) {
    console.log("Error calling OpenAI embedding API: ", e);
    throw new Error(`Error calling OpenAI embedding API: ${e}`);
  }
}