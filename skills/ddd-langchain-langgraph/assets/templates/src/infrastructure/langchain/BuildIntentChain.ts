import { JsonOutputParser } from "@langchain/core/output_parsers"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { ChatOpenAI } from "@langchain/openai"

interface IntentChainOutput {
  intent: string
  confidence: number
}

interface IntentChain {
  invoke(input: { input: string }): Promise<IntentChainOutput>
}

const BuildIntentChain = (): IntentChain => {
  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
  })

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Classify intent as support, sales, or triage and return JSON with keys intent and confidence."
    ],
    ["human", "{input}"]
  ])

  const parser = new JsonOutputParser<IntentChainOutput>()
  return (prompt.pipe(model).pipe(parser) as IntentChain)
}

export { BuildIntentChain, type IntentChain, type IntentChainOutput }
