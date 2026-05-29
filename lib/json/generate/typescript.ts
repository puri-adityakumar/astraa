export async function generateTypeScript(
  jsonText: string,
  typeName: string,
): Promise<string> {
  const { quicktype, jsonInputForTargetLanguage, InputData } = await import(
    "quicktype-core"
  );
  const jsonInput = jsonInputForTargetLanguage("typescript");
  await jsonInput.addSource({ name: typeName, samples: [jsonText] });
  const inputData = new InputData();
  inputData.addInput(jsonInput);
  const result = await quicktype({
    inputData,
    lang: "typescript",
    rendererOptions: {
      "just-types": "true",
      "prefer-types": "true",
      "prefer-unions": "true",
    },
  });
  return result.lines.join("\n");
}
