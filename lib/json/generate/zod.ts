export async function generateZod(
  jsonText: string,
  typeName: string,
): Promise<string> {
  const { quicktype, jsonInputForTargetLanguage, InputData } = await import(
    "quicktype-core"
  );
  const jsonInput = jsonInputForTargetLanguage("typescript-zod");
  await jsonInput.addSource({ name: typeName, samples: [jsonText] });
  const inputData = new InputData();
  inputData.addInput(jsonInput);
  const result = await quicktype({
    inputData,
    lang: "typescript-zod",
  });
  return result.lines.join("\n");
}
