import { RouterContext } from "jsr:@oak/oak/router";
import handleErrors from "./shared/handleErrors.ts";
import { DenoSandboxesClient } from "../deno-api/DenoSandboxesClient.ts";

const sampleCode = Deno.readTextFileSync(
  `${Deno.cwd()}/server/samples/code.ts`,
);

export default async function (
  ctx: RouterContext<string, Record<string, string>>,
) {
  await handleErrors(ctx, async () => {
    const client = new DenoSandboxesClient();
    let id = ctx?.params?.id;
    let url = "";
    let isAnUpdate = true;

    if (!id) {
      const sandbox = await client.createSandbox();
      id = sandbox.id;
      url = sandbox.url;
      isAnUpdate = false; // First deploy, not an update
    }

    const postBody = await ctx?.request?.body.json();

    const code = postBody
      ? postBody.code
      : sampleCode;

    // Slightly overcooked here given we're just using one file
    // But we could add multiple files to the deployment here.
    const files = new Map<string, string>();
    files.set("main.ts", code);

    const deployment = await client.deploy(id, files, isAnUpdate);

    ctx.response.status = 201;
    ctx.response.body = JSON.stringify({
      ...deployment,
      url: url
    });
  });
}
