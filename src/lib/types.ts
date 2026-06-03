export type AgentChatMessage = {
  kind: "chat";
  text: string;
};

export type AgentTransaction = {
  kind: "transaction";
  merchant: string;
  items: { name: string; price: number; quantity: number }[];
  fees: { tip: number; priority: number; service: number };
  reasoning: string;
  subtotal: number;
  total: number;
};

export type AgentSubmission = AgentChatMessage | AgentTransaction;

export type DriftChallenge = {
  intent_reconstruction: string;
  drift_candidates: string[];
  questions: string[];
};

export type AgentDriftResponses = {
  answers: { question_index: number; response: string }[];
};

export type DriftVerdict = {
  scores: { question_index: number; score: "coherent" | "weak" | "incoherent"; note: string }[];
  verdict: "APPROVE" | "MODIFY" | "ESCALATE" | "DENY";
  items_to_remove: string[];
  reasoning: string;
};

export type RunStep =
  | { type: "agent_message"; text: string }
  | { type: "transaction_submitted"; transaction: AgentTransaction; transactionId: string }
  | { type: "drift_challenge"; challenge: DriftChallenge }
  | { type: "agent_responses"; responses: AgentDriftResponses }
  | { type: "drift_verdict"; verdict: DriftVerdict }
  | { type: "error"; message: string; stage: string }
  | { type: "done"; sessionId: string; transactionId?: string };
