import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import DeploymentViewer from "../components/DeploymentViewer.tsx";
import ApiClient from "../api/ApiClient.ts";
import Prism from "prismjs";
import "prismjs/components/prism-typescript.js";

const client = new ApiClient();

export default function EditCode() {
  const { id } = useParams();
  const [searchParams, _setSearchParams] = useSearchParams();

  // Editor state
  const [running, setRunning] = useState<string>("Run this code");
  const [url, setUrl] = useState<string>(searchParams.get("url")!);
  const [status, setStatus] = useState<string>("success");
  const [code, setCode] = useState<string>("");

  // Load default editor contents
  useEffect(() => {
    (async () => {
      const code = await client.getSampleCode();
      setCode(code);
    })();
  }, []);

  // UI Callbacks
  const deployChanges = async () => {
    setRunning("Running code...");

    const { status } = await client.deployProject(code, id!);

    // Force iframe refresh by appending a timestamp to the URL
    const url = searchParams.get("url")!;
    const updatedTimeStamp = new Date().getTime();
    const urlWithTimestamp = url + (url.includes("?") ? "&" : "?") + `t=${updatedTimeStamp}`;

    setUrl(urlWithTimestamp);
    setStatus(status);
    setRunning("Run this code");
  };

  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  return (
    <div className="editor">
      <textarea
        id="editing"
        className="code"
        value={code}
        spellCheck="false"
        onInput={(e) => setCode(e.target.value)}
      />
      <pre id="highlighting" aria-hidden="true">
        <code className="language-ts" id="highlighting-content">{code}</code>
      </pre>
      <button className="run" onClick={deployChanges}>{running}</button>
      <DeploymentViewer url={url} status={status} />
    </div>
  );
}
