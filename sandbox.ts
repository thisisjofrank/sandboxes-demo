import { Sandbox } from "@deno/sandbox";

await using sandbox = await Sandbox.create({ lifetime: "5m" });

await sandbox.writeTextFile(
    "server.js",
    "Deno.serve(() => new Response('Hello from Sandboxes'));",
);
const runtime = await sandbox.createJsRuntime({ entrypoint: "server.js" });
const publicUrl = await sandbox.exposeHttp({ port: 8000 });

await runtime.httpReady;
await sandbox.close(); // process can exit now

console.log(publicUrl); // https://<random>.sandbox.deno.net
