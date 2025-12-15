import doUntil from "./doUntil.ts";

export default class ApiClient {
  constructor(private readonly baseUrl: string = "") { }

  public async getSampleCode(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/sample`);
    return (await response.json()).code;
  }

  public async deployProject(
    code: string,
    id?: string,
  ): Promise<RunningSandbox> {
    const idSuffix = id ? `/${id}` : "";

    const response = await fetch(`${this.baseUrl}/api/project${idSuffix}`, {
      method: "POST",
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error("Failed to deploy project");
    }

    return await response.json();
  }
}
