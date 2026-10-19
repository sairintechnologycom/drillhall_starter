"use strict";

const { acceptRequest } = require("./intake");
const { lookupProcedure } = require("./procedures");
const { executeAction } = require("./executor");
const { getModelConfig, callModel, buildModelRequest } = require("./model-client");
const { buildRecommendation } = require("./recommendations");

/**
 * Handle one simulated ops request end-to-end (offline).
 * @param {{ id: string, tenantId: string, action: string, body?: string, procedureId?: string }} raw
 * @param {{ transport?: Function, run?: Function }} [hooks]
 */
function handleRequest(raw, hooks = {}) {
  const request = acceptRequest(raw);
  const procedure = raw.procedureId ? lookupProcedure(raw.procedureId) : null;
  const modelRequest = buildModelRequest(
    `Recommend next step for action=${request.action} procedure=${procedure?.id ?? "none"}`
  );
  return {
    request,
    procedure,
    modelRequest,
    modelConfig: getModelConfig(),
    execution: executeAction(request, { run: hooks.run }),
    // callModel is available for callers that inject a transport
    callModel: (prompt, options) => callModel(prompt, { ...options, transport: hooks.transport })
  };
}

module.exports = {
  handleRequest,
  acceptRequest,
  lookupProcedure,
  executeAction,
  getModelConfig,
  callModel,
  buildModelRequest,
  buildRecommendation
};
