// API response types

interface RunningSandbox {
  id: string;
  url: string;
  status: "success" | "deploying" | "error";
}

interface SampleCode {
  code: string;
}
