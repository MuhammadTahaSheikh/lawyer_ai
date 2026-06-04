/** Auto-generated from backend/routes/automations.js — 256 unique routes. Regenerate: `node scripts/generate-api-reference-automations.js` */

export const automationsCategory = {
  id: "automations",
  title: "Automations",
  description:
    "All HTTP routes under `/automations` (`server.js`). Entries below annotate **case id** when the handler reads `req.query` / `req.body` for `caseId` or `case_id` (scanner looks at the first ~150 lines of each route). For exact payloads, still read the handler in `automations.js`.",
};

export const automationsEndpoints = [
  {
    "id": "auto-get-noi-0",
    "title": "noi",
    "method": "GET",
    "path": "/automations/noi",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-noi-1",
    "title": "noi",
    "method": "POST",
    "path": "/automations/noi",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-noi-2",
    "title": "noi",
    "method": "PUT",
    "path": "/automations/noi",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-noi-status-3",
    "title": "noi/status",
    "method": "PUT",
    "path": "/automations/noi/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-noi-4",
    "title": "noi",
    "method": "DELETE",
    "path": "/automations/noi",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-noi-caseId-5",
    "title": "noi/:caseId",
    "method": "DELETE",
    "path": "/automations/noi/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-noi-trigger-6",
    "title": "noi/trigger",
    "method": "POST",
    "path": "/automations/noi/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-noi-rerun-7",
    "title": "noi/rerun",
    "method": "POST",
    "path": "/automations/noi/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-retainer-follow-up-1-8",
    "title": "retainer_follow_up_1",
    "method": "POST",
    "path": "/automations/retainer_follow_up_1",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-retainer-follow-up-2-9",
    "title": "retainer_follow_up_2",
    "method": "POST",
    "path": "/automations/retainer_follow_up_2",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-retainer-follow-up-3-10",
    "title": "retainer_follow_up_3",
    "method": "POST",
    "path": "/automations/retainer_follow_up_3",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-estimate-request-11",
    "title": "estimate_request",
    "method": "POST",
    "path": "/automations/estimate_request",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-estimate-follow-up-12",
    "title": "estimate_follow_up",
    "method": "POST",
    "path": "/automations/estimate_follow_up",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lor-to-carrier-13",
    "title": "lor_to_carrier",
    "method": "POST",
    "path": "/automations/lor_to_carrier",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-certified-policy-request-14",
    "title": "certified_policy_request",
    "method": "POST",
    "path": "/automations/certified_policy_request",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-certified-policy-follow-up-15",
    "title": "certified_policy_follow_up",
    "method": "POST",
    "path": "/automations/certified_policy_follow_up",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-submit-dfs-complaint-16",
    "title": "submit_dfs_complaint",
    "method": "POST",
    "path": "/automations/submit_dfs_complaint",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-settlement-demand-17",
    "title": "settlement_demand",
    "method": "POST",
    "path": "/automations/settlement_demand",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-settlement-follow-up-18",
    "title": "settlement_follow_up",
    "method": "POST",
    "path": "/automations/settlement_follow_up",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-request-dfs-mediation-19",
    "title": "request_dfs_mediation",
    "method": "POST",
    "path": "/automations/request_dfs_mediation",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-request-appraisal-20",
    "title": "request_appraisal",
    "method": "POST",
    "path": "/automations/request_appraisal",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-dfs-21",
    "title": "dfs",
    "method": "GET",
    "path": "/automations/dfs",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-dfs-22",
    "title": "dfs",
    "method": "POST",
    "path": "/automations/dfs",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-dfs-23",
    "title": "dfs",
    "method": "PUT",
    "path": "/automations/dfs",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-dfs-status-24",
    "title": "dfs/status",
    "method": "PUT",
    "path": "/automations/dfs/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-dfs-25",
    "title": "dfs",
    "method": "DELETE",
    "path": "/automations/dfs",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-dfs-caseId-26",
    "title": "dfs/:caseId",
    "method": "DELETE",
    "path": "/automations/dfs/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-dfs-trigger-27",
    "title": "dfs/trigger",
    "method": "POST",
    "path": "/automations/dfs/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-dfs-rerun-28",
    "title": "dfs/rerun",
    "method": "POST",
    "path": "/automations/dfs/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-dfs-queue-29",
    "title": "dfs/queue",
    "method": "POST",
    "path": "/automations/dfs/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-file-crn-30",
    "title": "file_crn",
    "method": "POST",
    "path": "/automations/file_crn",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-file-suit-breach-of-contract-31",
    "title": "file_suit_breach_of_contract",
    "method": "POST",
    "path": "/automations/file_suit_breach_of_contract",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-file-suit-declaratory-action-32",
    "title": "file_suit_declaratory_action",
    "method": "POST",
    "path": "/automations/file_suit_declaratory_action",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-noi-queue-33",
    "title": "noi/queue",
    "method": "POST",
    "path": "/automations/noi/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-turndown-letter-34",
    "title": "turndown_letter",
    "method": "GET",
    "path": "/automations/turndown_letter",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-turndown-letter-35",
    "title": "turndown_letter",
    "method": "POST",
    "path": "/automations/turndown_letter",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-turndown-letter-36",
    "title": "turndown_letter",
    "method": "PUT",
    "path": "/automations/turndown_letter",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-turndown-letter-status-37",
    "title": "turndown_letter/status",
    "method": "PUT",
    "path": "/automations/turndown_letter/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-turndown-letter-38",
    "title": "turndown_letter",
    "method": "DELETE",
    "path": "/automations/turndown_letter",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-turndown-letter-caseId-39",
    "title": "turndown_letter/:caseId",
    "method": "DELETE",
    "path": "/automations/turndown_letter/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-turndown-letter-trigger-40",
    "title": "turndown_letter/trigger",
    "method": "POST",
    "path": "/automations/turndown_letter/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-turndown-letter-rerun-41",
    "title": "turndown_letter/rerun",
    "method": "POST",
    "path": "/automations/turndown_letter/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-turndown-letter-queue-42",
    "title": "turndown_letter/queue",
    "method": "POST",
    "path": "/automations/turndown_letter/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-doah-letter-43",
    "title": "doah-letter",
    "method": "GET",
    "path": "/automations/doah-letter",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-doah-letter-44",
    "title": "doah-letter",
    "method": "POST",
    "path": "/automations/doah-letter",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-doah-letter-45",
    "title": "doah-letter",
    "method": "PUT",
    "path": "/automations/doah-letter",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-doah-letter-status-46",
    "title": "doah-letter/status",
    "method": "PUT",
    "path": "/automations/doah-letter/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-doah-letter-47",
    "title": "doah-letter",
    "method": "DELETE",
    "path": "/automations/doah-letter",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-doah-letter-caseId-48",
    "title": "doah-letter/:caseId",
    "method": "DELETE",
    "path": "/automations/doah-letter/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-doah-letter-trigger-49",
    "title": "doah-letter/trigger",
    "method": "POST",
    "path": "/automations/doah-letter/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-doah-letter-rerun-50",
    "title": "doah-letter/rerun",
    "method": "POST",
    "path": "/automations/doah-letter/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-doah-letter-queue-51",
    "title": "doah-letter/queue",
    "method": "POST",
    "path": "/automations/doah-letter/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-lor-to-client-52",
    "title": "lor_to_client",
    "method": "GET",
    "path": "/automations/lor_to_client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lor-to-client-53",
    "title": "lor_to_client",
    "method": "POST",
    "path": "/automations/lor_to_client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-lor-to-client-54",
    "title": "lor_to_client",
    "method": "PUT",
    "path": "/automations/lor_to_client",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-lor-to-client-status-55",
    "title": "lor_to_client/status",
    "method": "PUT",
    "path": "/automations/lor_to_client/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-lor-to-client-56",
    "title": "lor_to_client",
    "method": "DELETE",
    "path": "/automations/lor_to_client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-lor-to-client-caseId-57",
    "title": "lor_to_client/:caseId",
    "method": "DELETE",
    "path": "/automations/lor_to_client/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lor-to-client-trigger-58",
    "title": "lor_to_client/trigger",
    "method": "POST",
    "path": "/automations/lor_to_client/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lor-to-client-rerun-59",
    "title": "lor_to_client/rerun",
    "method": "POST",
    "path": "/automations/lor_to_client/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lor-to-client-queue-60",
    "title": "lor_to_client/queue",
    "method": "POST",
    "path": "/automations/lor_to_client/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-estimate-request-form-61",
    "title": "estimate_request_form",
    "method": "GET",
    "path": "/automations/estimate_request_form",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-estimate-request-form-62",
    "title": "estimate_request_form",
    "method": "POST",
    "path": "/automations/estimate_request_form",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-estimate-request-form-63",
    "title": "estimate_request_form",
    "method": "PUT",
    "path": "/automations/estimate_request_form",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-estimate-request-form-status-64",
    "title": "estimate_request_form/status",
    "method": "PUT",
    "path": "/automations/estimate_request_form/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-estimate-request-form-65",
    "title": "estimate_request_form",
    "method": "DELETE",
    "path": "/automations/estimate_request_form",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-estimate-request-form-caseId-66",
    "title": "estimate_request_form/:caseId",
    "method": "DELETE",
    "path": "/automations/estimate_request_form/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-estimate-request-form-trigger-67",
    "title": "estimate_request_form/trigger",
    "method": "POST",
    "path": "/automations/estimate_request_form/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-estimate-request-form-rerun-68",
    "title": "estimate_request_form/rerun",
    "method": "POST",
    "path": "/automations/estimate_request_form/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-estimate-request-form-queue-69",
    "title": "estimate_request_form/queue",
    "method": "POST",
    "path": "/automations/estimate_request_form/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-estimate-ems-invoices-submission-70",
    "title": "estimate_ems_invoices_submission",
    "method": "GET",
    "path": "/automations/estimate_ems_invoices_submission",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-estimate-ems-invoices-submission-71",
    "title": "estimate_ems_invoices_submission",
    "method": "POST",
    "path": "/automations/estimate_ems_invoices_submission",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-estimate-ems-invoices-submission-72",
    "title": "estimate_ems_invoices_submission",
    "method": "PUT",
    "path": "/automations/estimate_ems_invoices_submission",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-estimate-ems-invoices-submission-status-73",
    "title": "estimate_ems_invoices_submission/status",
    "method": "PUT",
    "path": "/automations/estimate_ems_invoices_submission/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-estimate-ems-invoices-submission-74",
    "title": "estimate_ems_invoices_submission",
    "method": "DELETE",
    "path": "/automations/estimate_ems_invoices_submission",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-estimate-ems-invoices-submission-caseId-75",
    "title": "estimate_ems_invoices_submission/:caseId",
    "method": "DELETE",
    "path": "/automations/estimate_ems_invoices_submission/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-estimate-ems-invoices-submission-trigger-76",
    "title": "estimate_ems_invoices_submission/trigger",
    "method": "POST",
    "path": "/automations/estimate_ems_invoices_submission/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-estimate-ems-invoices-submission-rerun-77",
    "title": "estimate_ems_invoices_submission/rerun",
    "method": "POST",
    "path": "/automations/estimate_ems_invoices_submission/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-estimate-ems-invoices-submission-queue-78",
    "title": "estimate_ems_invoices_submission/queue",
    "method": "POST",
    "path": "/automations/estimate_ems_invoices_submission/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-lor-to-ic-79",
    "title": "lor_to_ic",
    "method": "GET",
    "path": "/automations/lor_to_ic",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lor-to-ic-80",
    "title": "lor_to_ic",
    "method": "POST",
    "path": "/automations/lor_to_ic",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-lor-to-ic-81",
    "title": "lor_to_ic",
    "method": "PUT",
    "path": "/automations/lor_to_ic",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-lor-to-ic-status-82",
    "title": "lor_to_ic/status",
    "method": "PUT",
    "path": "/automations/lor_to_ic/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-lor-to-ic-83",
    "title": "lor_to_ic",
    "method": "DELETE",
    "path": "/automations/lor_to_ic",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-lor-to-ic-caseId-84",
    "title": "lor_to_ic/:caseId",
    "method": "DELETE",
    "path": "/automations/lor_to_ic/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lor-to-ic-trigger-85",
    "title": "lor_to_ic/trigger",
    "method": "POST",
    "path": "/automations/lor_to_ic/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lor-to-ic-rerun-86",
    "title": "lor_to_ic/rerun",
    "method": "POST",
    "path": "/automations/lor_to_ic/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lor-to-ic-queue-87",
    "title": "lor_to_ic/queue",
    "method": "POST",
    "path": "/automations/lor_to_ic/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-policy-request-automation-88",
    "title": "policy_request_automation",
    "method": "GET",
    "path": "/automations/policy_request_automation",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-policy-request-automation-89",
    "title": "policy_request_automation",
    "method": "POST",
    "path": "/automations/policy_request_automation",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-policy-request-automation-90",
    "title": "policy_request_automation",
    "method": "PUT",
    "path": "/automations/policy_request_automation",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-policy-request-automation-status-91",
    "title": "policy_request_automation/status",
    "method": "PUT",
    "path": "/automations/policy_request_automation/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-policy-request-automation-92",
    "title": "policy_request_automation",
    "method": "DELETE",
    "path": "/automations/policy_request_automation",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-policy-request-automation-caseId-93",
    "title": "policy_request_automation/:caseId",
    "method": "DELETE",
    "path": "/automations/policy_request_automation/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-policy-request-automation-trigger-94",
    "title": "policy_request_automation/trigger",
    "method": "POST",
    "path": "/automations/policy_request_automation/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-policy-request-automation-rerun-95",
    "title": "policy_request_automation/rerun",
    "method": "POST",
    "path": "/automations/policy_request_automation/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-policy-request-automation-queue-96",
    "title": "policy_request_automation/queue",
    "method": "POST",
    "path": "/automations/policy_request_automation/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-sal-request-english-97",
    "title": "sal_request_english",
    "method": "GET",
    "path": "/automations/sal_request_english",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-sal-request-english-98",
    "title": "sal_request_english",
    "method": "POST",
    "path": "/automations/sal_request_english",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-sal-english-99",
    "title": "sal-english",
    "method": "POST",
    "path": "/automations/sal-english",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-sal-request-english-100",
    "title": "sal_request_english",
    "method": "PUT",
    "path": "/automations/sal_request_english",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-sal-english-101",
    "title": "sal-english",
    "method": "PUT",
    "path": "/automations/sal-english",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-sal-request-english-102",
    "title": "sal_request_english",
    "method": "DELETE",
    "path": "/automations/sal_request_english",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-sal-request-english-trigger-103",
    "title": "sal_request_english/trigger",
    "method": "POST",
    "path": "/automations/sal_request_english/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-sal-request-english-rerun-104",
    "title": "sal_request_english/rerun",
    "method": "POST",
    "path": "/automations/sal_request_english/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-sal-request-english-queue-105",
    "title": "sal_request_english/queue",
    "method": "POST",
    "path": "/automations/sal_request_english/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-wriretapping-notice-letter-106",
    "title": "wriretapping_notice_letter",
    "method": "GET",
    "path": "/automations/wriretapping_notice_letter",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-wriretapping-notice-letter-107",
    "title": "wriretapping_notice_letter",
    "method": "POST",
    "path": "/automations/wriretapping_notice_letter",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-wriretapping-notice-letter-108",
    "title": "wriretapping_notice_letter",
    "method": "PUT",
    "path": "/automations/wriretapping_notice_letter",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-wriretapping-notice-letter-109",
    "title": "wriretapping_notice_letter",
    "method": "DELETE",
    "path": "/automations/wriretapping_notice_letter",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-wriretapping-notice-letter-trigger-110",
    "title": "wriretapping_notice_letter/trigger",
    "method": "POST",
    "path": "/automations/wriretapping_notice_letter/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-wriretapping-notice-letter-rerun-111",
    "title": "wriretapping_notice_letter/rerun",
    "method": "POST",
    "path": "/automations/wriretapping_notice_letter/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-wriretapping-notice-letter-queue-112",
    "title": "wriretapping_notice_letter/queue",
    "method": "POST",
    "path": "/automations/wriretapping_notice_letter/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-sal-request-spanish-113",
    "title": "sal_request_spanish",
    "method": "GET",
    "path": "/automations/sal_request_spanish",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-sal-request-spanish-114",
    "title": "sal_request_spanish",
    "method": "POST",
    "path": "/automations/sal_request_spanish",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-sal-spanish-115",
    "title": "sal-spanish",
    "method": "POST",
    "path": "/automations/sal-spanish",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-sal-request-spanish-116",
    "title": "sal_request_spanish",
    "method": "PUT",
    "path": "/automations/sal_request_spanish",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-sal-spanish-117",
    "title": "sal-spanish",
    "method": "PUT",
    "path": "/automations/sal-spanish",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-sal-request-spanish-118",
    "title": "sal_request_spanish",
    "method": "DELETE",
    "path": "/automations/sal_request_spanish",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-sal-request-spanish-trigger-119",
    "title": "sal_request_spanish/trigger",
    "method": "POST",
    "path": "/automations/sal_request_spanish/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-sal-request-spanish-rerun-120",
    "title": "sal_request_spanish/rerun",
    "method": "POST",
    "path": "/automations/sal_request_spanish/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-sal-request-spanish-queue-121",
    "title": "sal_request_spanish/queue",
    "method": "POST",
    "path": "/automations/sal_request_spanish/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-pfs-letter-to-client-122",
    "title": "pfs_letter_to_client",
    "method": "GET",
    "path": "/automations/pfs_letter_to_client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-letter-to-client-123",
    "title": "pfs_letter_to_client",
    "method": "POST",
    "path": "/automations/pfs_letter_to_client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-PFS-Letter-to-Client-124",
    "title": "PFS-Letter-to-Client",
    "method": "POST",
    "path": "/automations/PFS-Letter-to-Client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-pfs-letter-to-client-125",
    "title": "pfs-letter-to-client",
    "method": "POST",
    "path": "/automations/pfs-letter-to-client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-pfs-letter-to-client-126",
    "title": "pfs_letter_to_client",
    "method": "PUT",
    "path": "/automations/pfs_letter_to_client",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-PFS-Letter-to-Client-127",
    "title": "PFS-Letter-to-Client",
    "method": "PUT",
    "path": "/automations/PFS-Letter-to-Client",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-pfs-letter-to-client-128",
    "title": "pfs-letter-to-client",
    "method": "PUT",
    "path": "/automations/pfs-letter-to-client",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-pfs-letter-to-client-129",
    "title": "pfs_letter_to_client",
    "method": "DELETE",
    "path": "/automations/pfs_letter_to_client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-letter-to-client-trigger-130",
    "title": "pfs_letter_to_client/trigger",
    "method": "POST",
    "path": "/automations/pfs_letter_to_client/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-letter-to-client-rerun-131",
    "title": "pfs_letter_to_client/rerun",
    "method": "POST",
    "path": "/automations/pfs_letter_to_client/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-letter-to-client-queue-132",
    "title": "pfs_letter_to_client/queue",
    "method": "POST",
    "path": "/automations/pfs_letter_to_client/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-pfs-to-client-spanish-133",
    "title": "pfs_to_client_spanish",
    "method": "GET",
    "path": "/automations/pfs_to_client_spanish",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-to-client-spanish-134",
    "title": "pfs_to_client_spanish",
    "method": "POST",
    "path": "/automations/pfs_to_client_spanish",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-PFS-to-Client-Spanish-135",
    "title": "PFS-to-Client-Spanish",
    "method": "POST",
    "path": "/automations/PFS-to-Client-Spanish",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-pfs-to-client-spanish-136",
    "title": "pfs-to-client-spanish",
    "method": "POST",
    "path": "/automations/pfs-to-client-spanish",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-pfs-to-client-spanish-137",
    "title": "pfs_to_client_spanish",
    "method": "PUT",
    "path": "/automations/pfs_to_client_spanish",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-PFS-to-Client-Spanish-138",
    "title": "PFS-to-Client-Spanish",
    "method": "PUT",
    "path": "/automations/PFS-to-Client-Spanish",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-pfs-to-client-spanish-139",
    "title": "pfs-to-client-spanish",
    "method": "PUT",
    "path": "/automations/pfs-to-client-spanish",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-pfs-to-client-spanish-140",
    "title": "pfs_to_client_spanish",
    "method": "DELETE",
    "path": "/automations/pfs_to_client_spanish",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-to-client-spanish-trigger-141",
    "title": "pfs_to_client_spanish/trigger",
    "method": "POST",
    "path": "/automations/pfs_to_client_spanish/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-to-client-spanish-rerun-142",
    "title": "pfs_to_client_spanish/rerun",
    "method": "POST",
    "path": "/automations/pfs_to_client_spanish/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-to-client-spanish-queue-143",
    "title": "pfs_to_client_spanish/queue",
    "method": "POST",
    "path": "/automations/pfs_to_client_spanish/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-pfs-to-defendant-144",
    "title": "pfs_to_defendant",
    "method": "GET",
    "path": "/automations/pfs_to_defendant",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-to-defendant-145",
    "title": "pfs_to_defendant",
    "method": "POST",
    "path": "/automations/pfs_to_defendant",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-PFS-to-defendant-146",
    "title": "PFS-to-defendant",
    "method": "POST",
    "path": "/automations/PFS-to-defendant",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-pfs-to-defendant-147",
    "title": "pfs-to-defendant",
    "method": "POST",
    "path": "/automations/pfs-to-defendant",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-pfs-to-defendant-148",
    "title": "pfs_to_defendant",
    "method": "PUT",
    "path": "/automations/pfs_to_defendant",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-PFS-to-defendant-149",
    "title": "PFS-to-defendant",
    "method": "PUT",
    "path": "/automations/PFS-to-defendant",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-pfs-to-defendant-150",
    "title": "pfs-to-defendant",
    "method": "PUT",
    "path": "/automations/pfs-to-defendant",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-pfs-to-defendant-151",
    "title": "pfs_to_defendant",
    "method": "DELETE",
    "path": "/automations/pfs_to_defendant",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-to-defendant-trigger-152",
    "title": "pfs_to_defendant/trigger",
    "method": "POST",
    "path": "/automations/pfs_to_defendant/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-to-defendant-rerun-153",
    "title": "pfs_to_defendant/rerun",
    "method": "POST",
    "path": "/automations/pfs_to_defendant/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-pfs-to-defendant-queue-154",
    "title": "pfs_to_defendant/queue",
    "method": "POST",
    "path": "/automations/pfs_to_defendant/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-trial-letter-to-client-155",
    "title": "trial_letter_to_client",
    "method": "GET",
    "path": "/automations/trial_letter_to_client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-trial-letter-to-client-156",
    "title": "trial_letter_to_client",
    "method": "POST",
    "path": "/automations/trial_letter_to_client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-Trial-Letter-to-Client-157",
    "title": "Trial-Letter-to-Client",
    "method": "POST",
    "path": "/automations/Trial-Letter-to-Client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-trial-letter-to-client-158",
    "title": "trial-letter-to-client",
    "method": "POST",
    "path": "/automations/trial-letter-to-client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-trial-letter-to-client-159",
    "title": "trial_letter_to_client",
    "method": "PUT",
    "path": "/automations/trial_letter_to_client",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-Trial-Letter-to-Client-160",
    "title": "Trial-Letter-to-Client",
    "method": "PUT",
    "path": "/automations/Trial-Letter-to-Client",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-trial-letter-to-client-161",
    "title": "trial-letter-to-client",
    "method": "PUT",
    "path": "/automations/trial-letter-to-client",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-trial-letter-to-client-162",
    "title": "trial_letter_to_client",
    "method": "DELETE",
    "path": "/automations/trial_letter_to_client",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-trial-letter-to-client-trigger-163",
    "title": "trial_letter_to_client/trigger",
    "method": "POST",
    "path": "/automations/trial_letter_to_client/trigger",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-trial-letter-to-client-rerun-164",
    "title": "trial_letter_to_client/rerun",
    "method": "POST",
    "path": "/automations/trial_letter_to_client/rerun",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-trial-letter-to-client-queue-165",
    "title": "trial_letter_to_client/queue",
    "method": "POST",
    "path": "/automations/trial_letter_to_client/queue",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-get-crn-166",
    "title": "crn",
    "method": "GET",
    "path": "/automations/crn",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-crn-167",
    "title": "crn",
    "method": "POST",
    "path": "/automations/crn",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-crn-168",
    "title": "crn",
    "method": "PUT",
    "path": "/automations/crn",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-crn-status-169",
    "title": "crn/status",
    "method": "PUT",
    "path": "/automations/crn/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-crn-170",
    "title": "crn",
    "method": "DELETE",
    "path": "/automations/crn",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-crn-caseId-171",
    "title": "crn/:caseId",
    "method": "DELETE",
    "path": "/automations/crn/:caseId",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-crn-trigger-172",
    "title": "crn/trigger",
    "method": "POST",
    "path": "/automations/crn/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-crn-rerun-173",
    "title": "crn/rerun",
    "method": "POST",
    "path": "/automations/crn/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-crn-queue-174",
    "title": "crn/queue",
    "method": "POST",
    "path": "/automations/crn/queue",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-physical-mail-send-175",
    "title": "physical-mail/send",
    "method": "POST",
    "path": "/automations/physical-mail/send",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-physical-mail-176",
    "title": "physical-mail",
    "method": "GET",
    "path": "/automations/physical-mail",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-physical-mail-177",
    "title": "physical-mail",
    "method": "PUT",
    "path": "/automations/physical-mail",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-get-click2mail-test-auth-178",
    "title": "click2mail/test-auth",
    "method": "GET",
    "path": "/automations/click2mail/test-auth",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-click2mail-upload-document-179",
    "title": "click2mail/upload-document",
    "method": "POST",
    "path": "/automations/click2mail/upload-document",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-click2mail-upload-address-180",
    "title": "click2mail/upload-address",
    "method": "POST",
    "path": "/automations/click2mail/upload-address",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-click2mail-create-job-181",
    "title": "click2mail/create-job",
    "method": "POST",
    "path": "/automations/click2mail/create-job",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-click2mail-submit-job-182",
    "title": "click2mail/submit-job",
    "method": "POST",
    "path": "/automations/click2mail/submit-job",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-get-physical-mail-case-data-183",
    "title": "physical-mail/case-data",
    "method": "GET",
    "path": "/automations/physical-mail/case-data",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-click2mail-send-physical-mail-184",
    "title": "click2mail/send-physical-mail",
    "method": "POST",
    "path": "/automations/click2mail/send-physical-mail",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-get-response-to-mdt-185",
    "title": "response_to_mdt",
    "method": "GET",
    "path": "/automations/response_to_mdt",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-response-to-mdt-cases-caseId-186",
    "title": "response-to-mdt/cases/:caseId",
    "method": "GET",
    "path": "/automations/response-to-mdt/cases/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-response-to-mdt-187",
    "title": "response_to_mdt",
    "method": "POST",
    "path": "/automations/response_to_mdt",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-response-to-mdt-188",
    "title": "response_to_mdt",
    "method": "PUT",
    "path": "/automations/response_to_mdt",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-response-to-mdt-189",
    "title": "response-to-mdt",
    "method": "PUT",
    "path": "/automations/response-to-mdt",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-response-to-mdt-190",
    "title": "response-to-mdt",
    "method": "POST",
    "path": "/automations/response-to-mdt",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-response-to-mdt-191",
    "title": "response_to_mdt",
    "method": "DELETE",
    "path": "/automations/response_to_mdt",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-response-to-mdt-trigger-192",
    "title": "response_to_mdt/trigger",
    "method": "POST",
    "path": "/automations/response_to_mdt/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-response-to-mdt-webhook-193",
    "title": "response_to_mdt/webhook",
    "method": "POST",
    "path": "/automations/response_to_mdt/webhook",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-response-to-mdt-ui-path-trigger-194",
    "title": "response_to_mdt/ui-path-trigger",
    "method": "POST",
    "path": "/automations/response_to_mdt/ui-path-trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-response-to-mdt-rerun-195",
    "title": "response_to_mdt/rerun",
    "method": "POST",
    "path": "/automations/response_to_mdt/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-presuit-demand-196",
    "title": "presuit_demand",
    "method": "GET",
    "path": "/automations/presuit_demand",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-presuit-demand-cases-caseId-197",
    "title": "presuit-demand/cases/:caseId",
    "method": "GET",
    "path": "/automations/presuit-demand/cases/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-presuit-demand-198",
    "title": "presuit_demand",
    "method": "POST",
    "path": "/automations/presuit_demand",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-presuit-demand-phase-2-trigger-199",
    "title": "presuit_demand/phase-2-trigger",
    "method": "POST",
    "path": "/automations/presuit_demand/phase-2-trigger",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-presuit-demand-200",
    "title": "presuit_demand",
    "method": "PUT",
    "path": "/automations/presuit_demand",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-presuit-demand-201",
    "title": "presuit-demand",
    "method": "PUT",
    "path": "/automations/presuit-demand",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-presuit-demand-202",
    "title": "presuit-demand",
    "method": "POST",
    "path": "/automations/presuit-demand",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-presuit-demand-203",
    "title": "presuit_demand",
    "method": "DELETE",
    "path": "/automations/presuit_demand",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-presuit-demand-trigger-204",
    "title": "presuit_demand/trigger",
    "method": "POST",
    "path": "/automations/presuit_demand/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-presuit-demand-webhook-205",
    "title": "presuit_demand/webhook",
    "method": "POST",
    "path": "/automations/presuit_demand/webhook",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-presuit-demand-ui-path-trigger-206",
    "title": "presuit_demand/ui-path-trigger",
    "method": "POST",
    "path": "/automations/presuit_demand/ui-path-trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-presuit-demand-rerun-207",
    "title": "presuit_demand/rerun",
    "method": "POST",
    "path": "/automations/presuit_demand/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-ssdi-esign-208",
    "title": "ssdi_esign",
    "method": "GET",
    "path": "/automations/ssdi_esign",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-ssdi-esign-cases-caseId-209",
    "title": "ssdi-esign/cases/:caseId",
    "method": "GET",
    "path": "/automations/ssdi-esign/cases/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-ssdi-esign-210",
    "title": "ssdi_esign",
    "method": "POST",
    "path": "/automations/ssdi_esign",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-ssdi-esign-phase-2-trigger-211",
    "title": "ssdi_esign/phase-2-trigger",
    "method": "POST",
    "path": "/automations/ssdi_esign/phase-2-trigger",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-ssdi-esign-212",
    "title": "ssdi_esign",
    "method": "PUT",
    "path": "/automations/ssdi_esign",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-ssdi-esign-213",
    "title": "ssdi-esign",
    "method": "PUT",
    "path": "/automations/ssdi-esign",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-ssdi-esign-214",
    "title": "ssdi-esign",
    "method": "POST",
    "path": "/automations/ssdi-esign",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-ssdi-esign-215",
    "title": "ssdi_esign",
    "method": "DELETE",
    "path": "/automations/ssdi_esign",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-ssdi-esign-trigger-216",
    "title": "ssdi_esign/trigger",
    "method": "POST",
    "path": "/automations/ssdi_esign/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-ssdi-esign-webhook-217",
    "title": "ssdi_esign/webhook",
    "method": "POST",
    "path": "/automations/ssdi_esign/webhook",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-ssdi-esign-ui-path-trigger-218",
    "title": "ssdi_esign/ui-path-trigger",
    "method": "POST",
    "path": "/automations/ssdi_esign/ui-path-trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-ssdi-esign-rerun-219",
    "title": "ssdi_esign/rerun",
    "method": "POST",
    "path": "/automations/ssdi_esign/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lawsuits-220",
    "title": "lawsuits",
    "method": "POST",
    "path": "/automations/lawsuits",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-ui-path-trigger-221",
    "title": "ui-path-trigger",
    "method": "POST",
    "path": "/automations/ui-path-trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-lawsuits-auto-222",
    "title": "lawsuits-auto",
    "method": "POST",
    "path": "/automations/lawsuits-auto",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-lawsuits-auto-223",
    "title": "lawsuits-auto",
    "method": "GET",
    "path": "/automations/lawsuits-auto",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-lawsuits-auto-id-224",
    "title": "lawsuits-auto/:id",
    "method": "GET",
    "path": "/automations/lawsuits-auto/:id",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "id",
        "type": "string",
        "description": "Record or row id (see handler)."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-lawsuits-auto-case-case-id-225",
    "title": "lawsuits-auto/case/:case_id",
    "method": "GET",
    "path": "/automations/lawsuits-auto/case/:case_id",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "case_id",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-put-lawsuits-auto-id-226",
    "title": "lawsuits-auto/:id",
    "method": "PUT",
    "path": "/automations/lawsuits-auto/:id",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "id",
        "type": "string",
        "description": "Record or row id (see handler)."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-lawsuits-auto-id-227",
    "title": "lawsuits-auto/:id",
    "method": "DELETE",
    "path": "/automations/lawsuits-auto/:id",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [
      {
        "name": "id",
        "type": "string",
        "description": "Record or row id (see handler)."
      }
    ],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-duty-to-adjust-letter-228",
    "title": "duty_to_adjust_letter",
    "method": "POST",
    "path": "/automations/duty_to_adjust_letter",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-duty-to-adjust-letter-229",
    "title": "duty_to_adjust_letter",
    "method": "PUT",
    "path": "/automations/duty_to_adjust_letter",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-duty-to-adjust-letter-status-230",
    "title": "duty_to_adjust_letter/status",
    "method": "PUT",
    "path": "/automations/duty_to_adjust_letter/status",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-duty-to-adjust-letter-caseId-231",
    "title": "duty_to_adjust_letter/:caseId",
    "method": "DELETE",
    "path": "/automations/duty_to_adjust_letter/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-duty-to-adjust-letter-trigger-232",
    "title": "duty_to_adjust_letter/trigger",
    "method": "POST",
    "path": "/automations/duty_to_adjust_letter/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-duty-to-adjust-letter-rerun-233",
    "title": "duty_to_adjust_letter/rerun",
    "method": "POST",
    "path": "/automations/duty_to_adjust_letter/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-duty-to-adjust-letter-queue-234",
    "title": "duty_to_adjust_letter/queue",
    "method": "POST",
    "path": "/automations/duty_to_adjust_letter/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-turndown-letter-warranty-235",
    "title": "turndown_letter_warranty",
    "method": "GET",
    "path": "/automations/turndown_letter_warranty",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-turndown-letter-warranty-236",
    "title": "turndown_letter_warranty",
    "method": "POST",
    "path": "/automations/turndown_letter_warranty",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-turndown-letter-warranty-237",
    "title": "turndown_letter_warranty",
    "method": "PUT",
    "path": "/automations/turndown_letter_warranty",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-turndown-letter-warranty-status-238",
    "title": "turndown_letter_warranty/status",
    "method": "PUT",
    "path": "/automations/turndown_letter_warranty/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-turndown-letter-warranty-239",
    "title": "turndown_letter_warranty",
    "method": "DELETE",
    "path": "/automations/turndown_letter_warranty",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-turndown-letter-warranty-caseId-240",
    "title": "turndown_letter_warranty/:caseId",
    "method": "DELETE",
    "path": "/automations/turndown_letter_warranty/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-turndown-letter-warranty-trigger-241",
    "title": "turndown_letter_warranty/trigger",
    "method": "POST",
    "path": "/automations/turndown_letter_warranty/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-turndown-letter-warranty-rerun-242",
    "title": "turndown_letter_warranty/rerun",
    "method": "POST",
    "path": "/automations/turndown_letter_warranty/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-turndown-letter-warranty-queue-243",
    "title": "turndown_letter_warranty/queue",
    "method": "POST",
    "path": "/automations/turndown_letter_warranty/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-get-employment-turndown-244",
    "title": "employment_turndown",
    "method": "GET",
    "path": "/automations/employment_turndown",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-employment-turndown-245",
    "title": "employment_turndown",
    "method": "POST",
    "path": "/automations/employment_turndown",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-post-turndown-letter-employment-246",
    "title": "turndown-letter-employment",
    "method": "POST",
    "path": "/automations/turndown-letter-employment",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-turndown-letter-employment-247",
    "title": "turndown-letter-employment",
    "method": "PUT",
    "path": "/automations/turndown-letter-employment",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-turndown-letter-employment-status-248",
    "title": "turndown-letter-employment/status",
    "method": "PUT",
    "path": "/automations/turndown-letter-employment/status",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **JSON body** (typical for POST/PUT/PATCH/DELETE). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-employment-turndown-249",
    "title": "employment_turndown",
    "method": "PUT",
    "path": "/automations/employment_turndown",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-put-employment-turndown-status-250",
    "title": "employment_turndown/status",
    "method": "PUT",
    "path": "/automations/employment_turndown/status",
    "description": "Automation route in `automations.js`. This handler reads `caseId` / `case_id` from **query and/or body** (see first lines of the handler). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ],
    "requestBody": {
      "description": "Include `caseId` and/or `case_id` in JSON (`req.body.caseId ?? req.body.case_id` in many handlers). Add other fields per the handler (n8n payloads, status, etc.).",
      "example": "{\n  \"caseId\": \"<case_id>\",\n  \"uid\": \"<firebase_uid_optional>\"\n}"
    }
  },
  {
    "id": "auto-delete-employment-turndown-251",
    "title": "employment_turndown",
    "method": "DELETE",
    "path": "/automations/employment_turndown",
    "description": "Automation route in `automations.js`. This handler requires `caseId` or `case_id` in the **query string** (typical for GET). See source for additional required fields.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "caseId",
        "type": "number|string",
        "description": "Internal case id. Handlers often accept `case_id` as an alternative query name (`caseId ?? case_id`)."
      }
    ],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-delete-employment-turndown-caseId-252",
    "title": "employment_turndown/:caseId",
    "method": "DELETE",
    "path": "/automations/employment_turndown/:caseId",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [
      {
        "name": "caseId",
        "type": "string",
        "description": "Internal case id."
      }
    ],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-employment-turndown-trigger-253",
    "title": "employment_turndown/trigger",
    "method": "POST",
    "path": "/automations/employment_turndown/trigger",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-employment-turndown-rerun-254",
    "title": "employment_turndown/rerun",
    "method": "POST",
    "path": "/automations/employment_turndown/rerun",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  },
  {
    "id": "auto-post-employment-turndown-queue-255",
    "title": "employment_turndown/queue",
    "method": "POST",
    "path": "/automations/employment_turndown/queue",
    "description": "Automation route implemented in `backend/routes/automations.js`. Open the handler for this path for full validation, optional fields, and side effects (email, n8n, DB).",
    "pathParams": [],
    "queryParams": [],
    "headers": [
      {
        "name": "x-api-key",
        "required": true,
        "description": "API key (global middleware)."
      },
      {
        "name": "x-user-uid",
        "required": false,
        "description": "Some automations use `req.body.uid ?? req.headers['x-user-uid']`."
      }
    ],
    "responses": [
      {
        "status": 200,
        "description": "JSON or text — see handler."
      },
      {
        "status": 400,
        "description": "Validation error (e.g. missing caseId)."
      },
      {
        "status": 500,
        "description": "Server or upstream error."
      }
    ]
  }
];
