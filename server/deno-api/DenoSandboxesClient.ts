import { Sandbox } from "@deno/sandbox";

export class DenoSandboxesClient {
  public async createSandbox() {
    const sandbox = await Sandbox.create({ lifetime: "5m" });
    const id = sandbox.id;
    const url = await sandbox.exposeHttp({ port: 8000 });
    await sandbox.close(); // process can exit now
    return { id, url };
  }

  public async deploy(id: string, files: Map<string, string>, isAnUpdate: boolean = false) {
    const sandbox = await Sandbox.connect({ id });
    for (const [name, content] of files) {
      await sandbox.writeTextFile(name, content);
    }

    if (isAnUpdate) {
      // Kill js runtime to refresh files because there is no hot-reload
      // There must be a better way to do this
      await sandbox.sh`pkill -f "deno run -A main.ts"`;
    }

    const runtime = await sandbox.createJsRuntime({ entrypoint: "main.ts" });
    const isReady = await runtime.httpReady;

    if (!isReady) {
      throw new Error("Failed to start HTTP server in sandbox");
    }

    await sandbox.close(); // process can exit now

    return {
      id: id,
      status: "success",
    } as RunningSandbox;
  }

}
