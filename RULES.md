# Agent-Doctor — Complete Rule Reference

> All 80+ audit rules across 6 categories. Every rule includes its ID, severity, what it detects, why it matters, and how to fix it.

**Severity levels:**
- `error` — Blocks production deployment. Must be fixed.
- `warn` — Should be fixed before shipping. Will lower your score.

---

## Quick Reference

| Category | Rules | IDs |
|---|---|---|
| Security | 18 | SEC-001 → SEC-018 |
| Configuration | 14 | CFG-001 → CFG-014 |
| Deployment | 13 | DEP-001 → DEP-013 |
| Reliability | 14 | REL-001 → REL-014 |
| Observability | 12 | OBS-001 → OBS-012 |
| Compliance | 11 | CMP-001 → CMP-011 |
| **Total** | **82** | |

---

## Security — SEC (18 rules)

---

### SEC-001 — Prompt Injection Risk in Tool Input
**Severity:** `error`  
**Category:** Security  
**OWASP Agentic:** A01

**What it detects:**
User-supplied content is passed directly into a tool call without sanitization or validation. The agent forwards raw input from untrusted sources — user messages, web content, uploaded files — into tools that execute code, run queries, or call external APIs.

**Why it matters:**
Prompt injection is the #1 attack vector for AI agents. A malicious user crafts input that hijacks the agent's behavior, exfiltrates data, or triggers unauthorized tool calls. Because the agent trusts its own context window, injected instructions carry the same weight as legitimate system prompt instructions.

**How to fix:**
Add an input validation and sanitization layer before tool calls. Strip or escape control characters, special tokens, and instruction-like patterns. Use an allowlist for expected input shapes. For high-risk tools, route input through a dedicated guardrail model.

```python
# Bad — raw user input passed directly to tool
result = web_search_tool(user_input)

# Good — sanitize first
sanitized = guardrail.validate(user_input, policy="no_injection")
result = web_search_tool(sanitized)
```

---

### SEC-002 — Hardcoded Secret or API Key
**Severity:** `error`  
**Category:** Security

**What it detects:**
API keys, tokens, passwords, or other secrets are hardcoded directly in source files, config files, or agent definitions rather than being loaded from environment variables or a secrets manager.

**Why it matters:**
Hardcoded secrets get committed to version control, appear in container image layers, surface in log output, and are visible in CI/CD build artifacts. This is one of the most common and damaging causes of credential leaks.

**How to fix:**
Move all secrets to environment variables or a secrets manager (AWS Secrets Manager, HashiCorp Vault, Doppler, GCP Secret Manager). Load them at runtime. Never commit `.env` files containing real credentials.

```python
# Bad
client = OpenAI(api_key="sk-abc123realkey...")

# Good
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
```

---

### SEC-003 — Destructive Tool Access Without Confirmation
**Severity:** `error`  
**Category:** Security  
**OWASP Agentic:** A02

**What it detects:**
A registered tool has write, delete, send, publish, or execute capabilities but there is no human-in-the-loop confirmation step or guardrail before it runs. The agent can take irreversible real-world actions autonomously.

**Why it matters:**
An agent that can delete records, send emails, modify files, or execute shell commands without any check can cause irreversible damage from a single hallucination or injection attack. This is classified as Excessive Agency — the agent has more power to act than it should be allowed to use autonomously.

**How to fix:**
Add a confirmation step for all destructive operations. For automated pipelines where human review is impractical, use a secondary validation model that checks the action matches an approved intent pattern before execution.

```python
# Bad
agent.register_tool(delete_user_tool)

# Good
agent.register_tool(
    delete_user_tool,
    require_confirmation=True,
    confirmation_prompt="Are you sure you want to delete user {user_id}?"
)
```

---

### SEC-004 — No Audit Logging on Tool Calls
**Severity:** `warn`  
**Category:** Security

**What it detects:**
Tool calls made by the agent are not logged with sufficient detail — tool name, inputs, outputs, timestamp, user context, session ID — to support post-incident investigation or compliance audits.

**Why it matters:**
Without an audit trail you cannot determine what your agent did, when, or why. This makes incident response, compliance audits, and debugging in production extremely difficult or impossible. Audit logs are also required by GDPR, HIPAA, and SOC 2.

**How to fix:**
Wrap every tool call in a logging decorator or middleware that records the full call context to a structured, tamper-evident log store.

```python
@audit_log(store="immutable_audit_store")
def web_search_tool(query: str, session_id: str) -> str:
    # All inputs, outputs, timestamps logged automatically
    ...
```

---

### SEC-005 — Excessive Agent Permissions
**Severity:** `warn`  
**Category:** Security  
**OWASP Agentic:** A02

**What it detects:**
The agent is granted access to tools, APIs, or data sources beyond what its documented purpose requires. The agent has registered capabilities it never actually uses during normal operation.

**Why it matters:**
Excess permissions expand the blast radius of any compromise, hallucination, or injection attack. Least-privilege is a foundational security principle — an agent that only needs to read data should never have write access.

**How to fix:**
Audit every registered tool against the agent's actual use cases and remove or scope-limit tools that are not required. Consider role-based tool sets for different agent personas or deployment environments.

---

### SEC-006 — Untrusted Data Written to Persistent Memory
**Severity:** `error`  
**Category:** Security  
**OWASP Agentic:** A03

**What it detects:**
Raw, unvalidated content from user inputs or external sources is written directly to the agent's long-term memory — vector store, key-value store, database — without content validation or trust scoring.

**Why it matters:**
Memory poisoning attacks allow adversaries to plant malicious instructions in the agent's memory that will influence future sessions, affect other users, and persist across restarts. A poisoned memory entry is effectively a persistent backdoor into the agent.

**How to fix:**
Validate and sanitize all content before writing to memory. Apply content policies and trust scoring based on the source. Implement a memory write guard that rejects instruction-like content from untrusted sources.

---

### SEC-007 — Unverified Third-Party Tool or Plugin Source
**Severity:** `error`  
**Category:** Security  
**OWASP Agentic:** A04

**What it detects:**
The agent loads tools, plugins, or MCP servers from third-party sources that are not pinned to a verified version, cryptographic hash, or trusted registry entry.

**Why it matters:**
Unverified tool sources are a supply chain attack vector. A compromised or malicious plugin can exfiltrate data, escalate privileges, alter agent behavior, or serve as a persistence mechanism for attackers.

**How to fix:**
Pin all third-party tool versions. Verify package integrity hashes. Use a private registry for internal tools. Conduct security review of third-party tools before registering them with production agents.

---

### SEC-008 — PII or Sensitive Data Logged in Tool Output
**Severity:** `error`  
**Category:** Security

**What it detects:**
Tool outputs containing personally identifiable information (PII), financial data, health records, or other sensitive content are being logged verbatim without redaction or masking.

**Why it matters:**
Logging PII violates GDPR, HIPAA, CCPA, and PCI-DSS depending on data type. It creates data breach exposure from log storage systems, log shipping pipelines, and log access by unauthorized personnel.

**How to fix:**
Apply a PII redaction layer to all tool outputs before logging. Use pattern matching or a dedicated redaction library to mask emails, phone numbers, credit card numbers, SSNs, and medical identifiers.

```python
from presidio_analyzer import AnalyzerEngine
from presidio_anonymizer import AnonymizerEngine

def safe_log(data: str):
    analyzer = AnalyzerEngine()
    anonymizer = AnonymizerEngine()
    results = analyzer.analyze(text=data, language="en")
    redacted = anonymizer.anonymize(text=data, analyzer_results=results)
    logger.info(redacted.text)
```

---

### SEC-009 — Agent Accepts Tool Results Without Validation
**Severity:** `warn`  
**Category:** Security

**What it detects:**
The agent passes tool output directly back into its reasoning loop without validating that the result matches the expected schema, format, or content policy.

**Why it matters:**
A compromised, hallucinating, or adversarially manipulated tool can inject malicious content into the agent's context through its output. Output validation is the second line of defense against injection attacks that bypass input filtering.

**How to fix:**
Add output validation for every tool. Define expected response schemas and content policies. Reject or flag outputs that do not conform before they enter the agent's context window.

---

### SEC-010 — No Rate Limiting on Agent-Facing APIs
**Severity:** `warn`  
**Category:** Security

**What it detects:**
APIs or services called by the agent have no rate limiting configured, meaning the agent could inadvertently or through adversarial manipulation trigger excessive usage leading to cost explosion or service disruption.

**Why it matters:**
Agents in runaway loops can call APIs thousands of times per minute. Without rate limits, a single bug or adversarial input can exhaust API quotas, cause billing spikes, trigger denial-of-service conditions on downstream services, or result in account suspension.

**How to fix:**
Configure rate limits on all API clients used by the agent. Implement exponential backoff and hard budget caps at the agent orchestrator level. Alert when usage approaches configured limits.

---

### SEC-011 — Tool Schema Exposes Internal System Details
**Severity:** `warn`  
**Category:** Security

**What it detects:**
Tool descriptions or schemas visible in the agent's context window contain internal system information such as database table names, internal hostnames, file paths, network topology, or infrastructure identifiers.

**Why it matters:**
Tool schemas are part of the agent's context window and can be extracted by a prompt injection attack or by directly questioning the agent. Internal system details in schemas give attackers a map of your infrastructure.

**How to fix:**
Write tool descriptions in user-facing, abstract language only. Never include internal identifiers, paths, hostnames, or system names in tool schemas. Use abstraction layers in tool definitions that separate public descriptions from internal implementation details.

---

### SEC-012 — No Secrets Rotation Policy
**Severity:** `warn`  
**Category:** Security

**What it detects:**
API keys and credentials used by the agent have no rotation policy configured. The same credentials have been in use without rotation for more than 90 days, detected via secrets manager metadata or commit history timestamps.

**Why it matters:**
Long-lived credentials are high-value targets. A silently compromised credential provides ongoing access until rotation. Rotation limits the exposure window and forces periodic verification that credentials are still valid.

**How to fix:**
Configure automatic rotation for all agent credentials in your secrets manager. Set a maximum credential lifetime of 30–90 days appropriate to the sensitivity of what the credential accesses. Alert on credentials approaching expiry.

---

### SEC-013 — Agent Process Runs with Elevated OS Privileges
**Severity:** `error`  
**Category:** Security

**What it detects:**
The agent process runs as root, administrator, or with elevated OS-level permissions that exceed what is needed for its function — detected via Dockerfile USER directives, process configuration, or deployment manifests.

**Why it matters:**
A compromised agent running as root can take full control of the host system. OS-level privilege escalation compounds every other security vulnerability — what would otherwise be a limited breach becomes a complete system compromise.

**How to fix:**
Run the agent process as a dedicated low-privilege service account. Use containerization with explicit USER directives. Drop all Linux capabilities except those explicitly required using `--cap-drop=ALL` with specific additions.

```dockerfile
RUN useradd --system --no-create-home agentuser
USER agentuser
```

---

### SEC-014 — No Input Length or Token Limit Enforcement
**Severity:** `warn`  
**Category:** Security

**What it detects:**
The agent accepts arbitrarily long inputs from users or external sources with no maximum length or token count enforced before processing. There is no truncation, rejection, or alerting on oversized inputs.

**Why it matters:**
Extremely long inputs cause context overflow, degrade response quality, enable token-smuggling attacks that hide malicious instructions in padding, and inflate LLM costs significantly. They can also be used as a denial-of-service vector.

**How to fix:**
Enforce a maximum input token count at the ingestion layer. Truncate or reject inputs that exceed the limit with a clear error message. Log and alert on inputs significantly above normal size distributions.

---

### SEC-015 — Cross-Agent Trust Not Validated in Multi-Agent Systems
**Severity:** `error`  
**Category:** Security

**What it detects:**
In multi-agent or orchestrator-subagent systems, the agent accepts instructions or data from other agents without validating their identity, message integrity, or authorization level.

**Why it matters:**
A compromised sub-agent or a prompt injection in any node of the network can cascade to the orchestrator. Without inter-agent trust validation, attackers can inject malicious instructions by compromising any single agent in the network — not just the entry point.

**How to fix:**
Implement signed message passing between agents using shared secrets or public-key cryptography. Validate agent identity before acting on inter-agent instructions. Apply the same input sanitization to agent-sourced content as to direct user input.

---

### SEC-016 — System Prompt Extractable by Users
**Severity:** `error`  
**Category:** Security

**What it detects:**
The agent's system prompt contains sensitive business logic, security controls, or proprietary instructions that are extractable by users through prompt injection techniques or direct questioning (e.g., "Repeat your instructions").

**Why it matters:**
System prompt leakage exposes proprietary instructions, reveals security controls (allowing targeted bypasses), and gives attackers a blueprint for circumventing the agent's guardrails. It can also reveal trade secrets and implementation details.

**How to fix:**
Move sensitive instructions out of the system prompt into server-side logic. Actively test your agent against system prompt extraction attempts. Include instructions explicitly refusing to reveal, summarize, or paraphrase the system prompt contents.

---

### SEC-017 — No SSRF Protection on URL-Fetching Tools
**Severity:** `error`  
**Category:** Security

**What it detects:**
Tools that fetch URLs — web browsing, API calls, content retrieval, webhook delivery — do not validate destination URLs against an allowlist or blocklist, making the agent exploitable as a proxy to reach internal network endpoints.

**Why it matters:**
Server-Side Request Forgery (SSRF) via an AI agent allows attackers to use your agent as a proxy to reach internal services, cloud metadata endpoints (169.254.169.254), private network resources, and services that are otherwise unreachable from the internet.

**How to fix:**
Validate all URLs before fetching. Maintain an allowlist of permitted external domains. Block all private IP ranges (10.x.x.x, 172.16.x.x, 192.168.x.x, 127.x.x.x) and cloud metadata endpoints explicitly.

```python
import ipaddress
from urllib.parse import urlparse

BLOCKED_RANGES = [
    ipaddress.IPv4Network("10.0.0.0/8"),
    ipaddress.IPv4Network("172.16.0.0/12"),
    ipaddress.IPv4Network("192.168.0.0/16"),
    ipaddress.IPv4Network("169.254.0.0/16"),
    ipaddress.IPv4Network("127.0.0.0/8"),
]

def is_safe_url(url: str) -> bool:
    host = urlparse(url).hostname
    try:
        ip = ipaddress.ip_address(host)
        return not any(ip in net for net in BLOCKED_RANGES)
    except ValueError:
        return True  # hostname, not IP — check allowlist separately
```

---

### SEC-018 — Agent Output Not Sanitized Before Rendering
**Severity:** `warn`  
**Category:** Security

**What it detects:**
Agent-generated output is rendered in a web interface or passed to downstream HTML-rendering systems without sanitization, creating exposure to cross-site scripting (XSS) or HTML injection attacks.

**Why it matters:**
If agent output is rendered in a browser without sanitization, a malicious user can craft inputs that cause the agent to include JavaScript or HTML in its response, which then executes in the browser of anyone who views the output.

**How to fix:**
Sanitize all agent output before rendering in web contexts using a trusted HTML sanitization library. Apply a strict Content Security Policy. Treat agent output as untrusted user content, not as trusted application-generated content.

---

## Configuration — CFG (14 rules)

---

### CFG-001 — max_tokens Not Defined in Tool or Model Config
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
One or more tools or the agent executor do not have a `max_tokens` (or equivalent) limit configured, allowing unbounded response generation with no ceiling on output length or cost per call.

**Why it matters:**
Unconstrained token generation leads to unpredictable per-request costs, slow responses, and potential runaway generation loops where the model produces thousands of tokens of low-quality output.

**How to fix:**
Set `max_tokens` explicitly on every LLM call and tool invocation. Choose a limit appropriate to the expected output length for each specific tool and task type.

```python
llm = ChatOpenAI(model="gpt-4o", max_tokens=1024)
```

---

### CFG-002 — No Memory TTL Policy Configured
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
The agent's memory backend has no time-to-live (TTL) policy configured, meaning memories — conversation history, episodic context, user preferences — are stored indefinitely without expiration.

**Why it matters:**
Indefinite memory growth leads to performance degradation as retrieval slows, increasing storage costs, and accumulation of stale or poisoned memories that negatively influence future agent behavior.

**How to fix:**
Configure TTL policies on your memory backend appropriate to your use case. Use tiered retention: short TTL (24 hours) for session memory, longer (30 days) for user preferences, archive or delete old episodic memory on schedule.

---

### CFG-003 — Required Environment Variable Missing
**Severity:** `error`  
**Category:** Configuration

**What it detects:**
One or more environment variables required by the agent — API keys, database URLs, service endpoints, feature flags — are not set in the current deployment environment.

**Why it matters:**
Missing environment variables cause silent failures, degraded behavior, or hard crashes at runtime. Catching this before deployment prevents production outages from the most preventable class of configuration error.

**How to fix:**
Add a startup validation routine that checks all required environment variables are present and non-empty before the agent initializes. Fail immediately with a clear list of missing variables.

```python
REQUIRED_ENV_VARS = [
    "OPENAI_API_KEY",
    "REDIS_URL",
    "DATABASE_URL",
    "AGENT_SECRET_KEY",
]

missing = [v for v in REQUIRED_ENV_VARS if not os.environ.get(v)]
if missing:
    raise EnvironmentError(f"Missing required environment variables: {missing}")
```

---

### CFG-004 — MCP Tool Schema Invalid or Incomplete
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
One or more tools registered via the Model Context Protocol have schemas that are missing required fields, use incorrect types, omit descriptions, or do not conform to the current MCP specification version.

**Why it matters:**
Invalid MCP schemas cause tools to fail silently or behave incorrectly. The model may be unable to call the tool at all, pass incorrect arguments, or misinterpret the tool's capabilities and purpose.

**How to fix:**
Validate all MCP tool schemas against the current MCP specification before registration. Use the MCP SDK's built-in schema validator. Ensure `name`, `description`, `inputSchema`, and `outputSchema` are complete, correctly typed, and include field descriptions.

---

### CFG-005 — Temperature Not Set or Set Too High for Task Type
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
The LLM temperature parameter is not explicitly configured, or is set above 0.9 for an agent that performs structured tasks such as tool calls, data extraction, code generation, or multi-step reasoning.

**Why it matters:**
High temperature increases output randomness and creativity. While desirable for open-ended creative tasks, it is harmful for agents that must produce reliable tool call syntax, parseable structured data, or consistent step-by-step reasoning.

**How to fix:**
Set temperature explicitly based on task type. Use 0.0–0.2 for deterministic structured tasks. Use 0.3–0.7 for balanced reasoning tasks. Reserve higher temperatures only for explicitly creative or ideation tasks.

---

### CFG-006 — No Fallback Model Configured
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
The agent has only one model provider configured with no fallback model or provider in case of outage, rate limit exhaustion, quota depletion, or regional unavailability.

**Why it matters:**
Model provider outages — even at OpenAI, Anthropic, or Google — happen. Without a fallback, a single provider incident takes the entire agent offline. Provider rate limits can also block individual users during high-traffic periods.

**How to fix:**
Configure a secondary model provider as a fallback using a routing layer (LiteLLM, RouteLLM, custom middleware). Define clear escalation: primary → secondary → graceful degradation response.

---

### CFG-007 — Agent Has No System Prompt
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
The agent is initialized with no system prompt, relying entirely on the base model's default behavior with no defined persona, scope constraints, behavioral guidelines, or safety instructions.

**Why it matters:**
Without a system prompt, the agent behaves inconsistently, lacks defined boundaries, and is significantly more susceptible to jailbreaking, scope creep, and prompt injection attacks. The system prompt is the primary mechanism for shaping agent behavior.

**How to fix:**
Define a clear, comprehensive system prompt that covers: the agent's role and identity, what it can and cannot help with, how it should handle out-of-scope requests, safety and content policies, and how to respond when uncertain.

---

### CFG-008 — Duplicate Tool Names Registered
**Severity:** `error`  
**Category:** Configuration

**What it detects:**
Two or more tools registered with the agent share the same name, creating an ambiguous tool registry where the correct tool to invoke is undefined.

**Why it matters:**
Duplicate tool names cause tool call failures, invocation of the wrong tool implementation, or silent errors depending on how the framework resolves name collisions. The model cannot reliably distinguish between tools with identical names.

**How to fix:**
Enforce globally unique tool names within each agent's tool registry. Add a validation step at agent initialization that detects and raises on any name collision. Use namespaced tool names for tools from different sources.

```python
def register_tool(self, tool):
    if tool.name in self._registry:
        raise ValueError(f"Tool name collision: '{tool.name}' is already registered")
    self._registry[tool.name] = tool
```

---

### CFG-009 — Tool Description Missing or Too Vague
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
One or more registered tools have descriptions that are empty, fewer than 10 words, or do not clearly explain what the tool does, what inputs it expects, when it should be used, and what it returns.

**Why it matters:**
Tool descriptions are the primary mechanism by which the model decides which tool to call and how to construct its arguments. Poor descriptions cause tool misuse, hallucinated argument values, incorrect tool selection, and degraded task completion quality.

**How to fix:**
Write specific, informative tool descriptions of 20–60 words. Include: what the tool does, the expected format and meaning of each input parameter, what the tool returns, and when it should be preferred over other tools. Test tool usage quality after updating descriptions.

---

### CFG-010 — No Context Window Management Strategy
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
The agent accumulates conversation history, tool outputs, and retrieved memory without any trimming, summarization, or priority-based management strategy. There is no mechanism to handle approaching context window limits.

**Why it matters:**
When input tokens exceed the model's context window limit, the framework silently truncates content — often removing critical system prompt instructions or early conversation context. The failure is silent and causes subtle, hard-to-diagnose behavioral changes.

**How to fix:**
Implement a context management strategy: sliding window (keep last N turns), progressive summarization of older turns, or priority-based trimming that always preserves the system prompt and most recent exchanges.

---

### CFG-011 — No Input Schema Defined for Tool Parameters
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
Tools are registered without explicit typed input schemas, relying on the model to infer argument types, names, and structure from the natural language description alone.

**Why it matters:**
Without schemas, models frequently hallucinate argument names, pass values of the wrong type, omit required parameters, or construct malformed argument objects — all of which cause tool call failures that degrade agent reliability.

**How to fix:**
Define typed input schemas for all tools using Pydantic models, JSON Schema, TypeScript interfaces, or your framework's native schema mechanism. Include field types, descriptions, validation constraints, and required/optional markers for every parameter.

```python
from pydantic import BaseModel, Field

class WebSearchInput(BaseModel):
    query: str = Field(..., description="The search query string, 3-100 characters")
    max_results: int = Field(5, ge=1, le=20, description="Number of results to return")
    language: str = Field("en", description="ISO 639-1 language code for results")
```

---

### CFG-012 — Streaming Not Configured for Long-Running Tools
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
Tools or agent responses that routinely generate large outputs or take significant time are not configured to stream results back to the client, forcing users to wait for complete responses before receiving any output.

**Why it matters:**
Non-streaming responses for long operations create poor perceived performance, increase client-side timeout risk, and consume more server memory buffering the complete response. Streaming dramatically improves user experience for any operation taking more than 1–2 seconds.

**How to fix:**
Enable streaming on all long-running tool calls and agent responses. Handle stream chunks progressively on the client to display output as it arrives.

---

### CFG-013 — No Agent Version or Release Metadata
**Severity:** `warn`  
**Category:** Configuration

**What it detects:**
The agent has no version number, author information, or release metadata documented in its configuration, startup logs, or codebase. There is no way to identify which version of the agent is running in any given environment.

**Why it matters:**
Without versioning, it is impossible to determine which agent version was running when an incident occurred, correlate behavior changes with specific releases, or confidently roll back to a known-good version after a problematic deployment.

**How to fix:**
Add a version field to your agent configuration. Log the agent version on startup. Include version in all health check responses, diagnostic reports, and error telemetry. Tag releases in version control.

---

### CFG-014 — Memory Backend Unreachable at Startup
**Severity:** `error`  
**Category:** Configuration

**What it detects:**
The configured memory backend — Redis, Pinecone, Chroma, Weaviate, PostgreSQL with pgvector — is not reachable when the agent initializes, but the agent starts anyway and silently operates without memory rather than failing fast.

**Why it matters:**
An agent running without its memory backend operates in a fundamentally degraded state — it cannot recall past context, access long-term knowledge, or maintain session continuity. Silent failure is worse than a clear startup error because it hides the problem from operators.

**How to fix:**
Add a startup health check that verifies connectivity to all configured backends before the agent begins accepting requests. Raise a clear, descriptive error and refuse to start if any critical backend is unreachable.

---

## Deployment — DEP (13 rules)

---

### DEP-001 — No Dockerfile or Container Specification
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
The project has no `Dockerfile`, `docker-compose.yml`, or other container specification, meaning the agent cannot be built into a reproducible, portable deployment artifact.

**Why it matters:**
Containerization ensures deployment reproducibility — the same artifact runs identically in development, staging, and production. Without it, agents behave differently across environments due to dependency drift, OS differences, Python/Node version mismatches, and local configuration inconsistencies.

**How to fix:**
Add a production-grade `Dockerfile` that: pins the base image to a specific version, installs dependencies from a lockfile in a separate build stage, copies only necessary application files, and runs the agent as a non-root user.

---

### DEP-002 — No CI/CD Pipeline Configuration
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
The project has no CI/CD pipeline configuration: no `.github/workflows/`, no `.gitlab-ci.yml`, no `Jenkinsfile`, no `Makefile` with deploy targets, no equivalent automated deployment automation.

**Why it matters:**
Manual deployments are error-prone, inconsistent across team members, and impossible to audit. CI/CD ensures every deployment goes through the same validated path including tests, security scans, and health checks — and produces a clear deployment record.

**How to fix:**
Implement a CI/CD pipeline that runs unit tests, integration tests, the agent-doctor health check, builds a container image, pushes to a registry, and deploys through environment promotion (dev → staging → production) with automated quality gates at each stage.

---

### DEP-003 — No Rollback Strategy Defined
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
The deployment has no documented and tested rollback mechanism for reverting to the previous known-good version if a new deployment causes failures, regressions, or unacceptable behavior changes.

**Why it matters:**
Every deployment carries risk. Without a rollback strategy, a bad deployment requires a forward-fix — writing, testing, and deploying new code under pressure while users are impacted. Rollback should be a routine, practiced operation that takes minutes.

**How to fix:**
Implement one of: blue-green deployments (switch traffic between environments), canary releases (route small percentage to new version first), or versioned container tags that allow instant traffic revert. Document and drill the rollback procedure before your next deployment.

---

### DEP-004 — No Health Check Endpoint
**Severity:** `error`  
**Category:** Deployment

**What it detects:**
The deployed agent exposes no `/health`, `/ready`, `/ping` or equivalent endpoint that container orchestration systems (Kubernetes, ECS, load balancers) can use to verify liveness and readiness.

**Why it matters:**
Without health check endpoints, orchestrators cannot distinguish a healthy agent from one that has crashed, deadlocked, or lost connectivity to its dependencies. Traffic continues routing to broken instances until a human notices.

**How to fix:**
Expose two endpoints: `/health` (liveness — is the process alive?) and `/ready` (readiness — are all dependencies reachable and the agent ready to serve?). Configure your orchestrator to use both.

```python
@app.get("/health")
def health():
    return {"status": "ok", "version": AGENT_VERSION}

@app.get("/ready")
def ready():
    checks = {
        "memory_backend": check_redis(),
        "model_provider": check_openai(),
        "database": check_db(),
    }
    all_healthy = all(checks.values())
    return JSONResponse(
        content={"status": "ready" if all_healthy else "degraded", "checks": checks},
        status_code=200 if all_healthy else 503
    )
```

---

### DEP-005 — Production and Development Config Not Separated
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
The agent uses the same configuration for development and production environments with no environment-specific separation. Debug settings, mock tools, relaxed security, or development API keys are present in production.

**Why it matters:**
Development configurations are fundamentally inappropriate for production: debug logging exposes sensitive data, mock tools return fake results, relaxed rate limits allow abuse, and development API keys have different quotas and monitoring.

**How to fix:**
Use environment-specific configuration files or a configuration management system (AWS Parameter Store, HashiCorp Vault, environment-specific `.env` files that are never committed) that applies environment-appropriate settings automatically based on a `DEPLOY_ENV` variable.

---

### DEP-006 — No Dependency Lockfile
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
The project has no dependency lockfile — no `poetry.lock`, `requirements.txt` with pinned versions, `package-lock.json`, `Pipfile.lock`, or `uv.lock` — meaning dependency versions are resolved fresh at install time.

**Why it matters:**
Without pinned dependencies, a new install can silently pull in a breaking dependency version, a security vulnerability, or a behavioral change in a transitive dependency. Production deployments can differ from tested builds in ways that are extremely difficult to diagnose.

**How to fix:**
Generate and commit a lockfile using your package manager. Treat lockfile updates as deliberate, tested changes — not automatic. Pin major, minor, and patch versions for all direct dependencies in production.

---

### DEP-007 — Container Process Runs as Root
**Severity:** `error`  
**Category:** Deployment

**What it detects:**
The Dockerfile or container specification does not include a `USER` directive switching to a non-root user, meaning the agent process runs as root (UID 0) inside the container.

**Why it matters:**
Running as root inside a container means that any container escape vulnerability gives the attacker root-level access on the host node. This is a critical security failure that amplifies the impact of every other vulnerability.

**How to fix:**
Create a dedicated non-root service user in the Dockerfile and switch to it before the final CMD/ENTRYPOINT. This is a non-negotiable baseline container security control.

```dockerfile
RUN groupadd --gid 1001 agentgroup && \
    useradd --uid 1001 --gid agentgroup --no-create-home agentuser
USER agentuser
```

---

### DEP-008 — No CPU or Memory Resource Limits on Container
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
The container deployment manifest — Kubernetes Deployment, ECS Task Definition, docker-compose — has no CPU or memory resource limits configured, allowing the agent to consume unlimited host resources.

**Why it matters:**
An agent in a runaway loop, processing an unusually large request, or experiencing a memory leak can starve co-located services of resources. Without limits, a single misbehaving agent instance can destabilize the entire host node.

**How to fix:**
Set both resource requests (guaranteed allocation) and limits (maximum allowed) in your container spec. Base limits on observed peak usage from load testing plus a 25% safety margin.

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "1000m"
```

---

### DEP-009 — Secrets Hardcoded in Container or Deployment Definition
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
Secret values are present directly in container definitions — Dockerfile `ENV` instructions, Kubernetes deployment YAML `env` blocks, docker-compose `environment` sections — rather than being injected at runtime from an external secrets store.

**Why it matters:**
Secrets in container definitions are baked into image layers (permanently readable from the image), visible in Kubernetes API responses, committed to infrastructure-as-code repositories, and logged by CI/CD systems. Each is an independent leak vector.

**How to fix:**
Use Kubernetes Secrets with a CSI driver, AWS Secrets Manager with IAM roles, HashiCorp Vault Agent, or GCP Secret Manager to inject secret values at container runtime. Never place literal secret values in any file committed to version control.

---

### DEP-010 — No Staging Environment Before Production
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
The deployment pipeline promotes directly from CI or development to production with no intermediate staging environment that mirrors production configuration and infrastructure.

**Why it matters:**
Production behavior cannot be fully replicated in unit or integration tests. A staging environment catches configuration errors, integration failures, performance regressions, and infrastructure-specific issues before they impact real users.

**How to fix:**
Create a staging environment that mirrors production: same infrastructure tier, same configuration (with staging-equivalent credentials), same deployment process. Require successful staging deployment and automated smoke tests before production promotion.

---

### DEP-011 — Base Image Not Pinned to Specific Version or Digest
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
The Dockerfile uses a mutable image tag — `:latest`, `:stable`, `:3.11` — rather than a specific immutable digest or fully-qualified version tag, meaning the build can silently pull a different base image on each build.

**Why it matters:**
Mutable image tags can change without warning. A `:latest` update can introduce breaking dependency changes, new security vulnerabilities, Python/Node version changes, or behavioral differences that affect your agent in ways that are extremely difficult to diagnose.

**How to fix:**
Pin base images to a fully-qualified, immutable version tag or SHA256 digest. Update base images deliberately as part of a tested, reviewed process — not automatically on every build.

```dockerfile
# Bad
FROM python:latest
FROM python:3.11

# Good
FROM python:3.11.9-slim
# Or with digest for maximum reproducibility:
FROM python:3.11.9-slim@sha256:a1b2c3d4...
```

---

### DEP-012 — No Graceful Shutdown Handling
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
The agent process does not handle `SIGTERM` (or `SIGINT` on Windows equivalent) shutdown signals, meaning it is killed mid-operation during deployments, scaling events, or node evictions without completing in-flight requests or flushing state.

**Why it matters:**
Container orchestrators send `SIGTERM` before forcefully killing a process. Agents that ignore it are killed while processing active requests — losing results, corrupting memory state, and dropping audit log entries. Users experience sudden unexplained failures.

**How to fix:**
Register a `SIGTERM` signal handler that: stops accepting new requests, allows in-flight requests to complete up to a timeout, flushes logs and telemetry, checkpoints in-progress tasks, then exits cleanly.

```python
import signal
import sys

def graceful_shutdown(signum, frame):
    logger.info("SIGTERM received — starting graceful shutdown")
    server.stop(grace=30)  # 30 second grace period
    flush_audit_logs()
    sys.exit(0)

signal.signal(signal.SIGTERM, graceful_shutdown)
```

---

### DEP-013 — No Multi-AZ or High Availability Strategy
**Severity:** `warn`  
**Category:** Deployment

**What it detects:**
The agent is deployed in a single availability zone or cloud region with no redundancy, failover configuration, or geographic distribution. A single infrastructure failure takes the entire agent offline.

**Why it matters:**
Availability zones experience outages. Regions experience outages. Hardware fails. Single-zone deployments have a 100% blast radius on any zonal failure, which is unacceptable for any production agent serving real users.

**How to fix:**
Deploy across at least two availability zones in the same region using a load balancer that distributes traffic and automatically routes around failed instances. For globally-critical agents, implement multi-region active-active or active-passive architecture.

---

## Reliability — REL (14 rules)

---

### REL-001 — No max_iterations Limit on Agent Executor
**Severity:** `error`  
**Category:** Reliability

**What it detects:**
The agent executor has no maximum iteration or step count configured, allowing the agent to loop indefinitely when it fails to make progress, gets confused, or encounters an unexpected tool response.

**Why it matters:**
Infinite loops are the most common production failure mode for AI agents. They exhaust LLM API quotas, generate unbounded costs in minutes, make the agent completely unresponsive to the user who triggered the loop, and can trigger rate-limit bans on your API account.

**How to fix:**
Set `max_iterations` explicitly on your agent executor. Choose a value appropriate to your most complex task — most tasks should complete within 10–20 iterations. Implement meaningful early stopping that returns a partial result rather than an error on limit hit.

```python
agent = AgentExecutor(
    agent=llm_chain,
    tools=tools,
    max_iterations=15,
    max_execution_time=60,  # seconds
    early_stopping_method="generate"
)
```

---

### REL-002 — Recursive Tool Call Loop Detected
**Severity:** `error`  
**Category:** Reliability

**What it detects:**
Static analysis or behavioral simulation detected a circular dependency in tool call chains — Tool A calls Tool B which calls Tool A — creating an infinite loop that neither tool can escape without external intervention.

**Why it matters:**
Recursive tool loops hit the max_iterations limit on every invocation, exhaust API credits, produce no useful output, and lock the agent in a state where it consumes maximum resources while doing nothing productive.

**How to fix:**
Redesign the tool architecture to eliminate circular dependencies. Add loop detection at the orchestrator level that tracks the current tool call stack and raises immediately on detected recursion. Consider consolidating tools that are always called together.

---

### REL-003 — No Timeout Configured on Tool Calls
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
Individual tool calls have no timeout configured. If an external API, database, or service hangs or responds slowly, the agent waits indefinitely — blocking the user's request for the duration.

**Why it matters:**
External services fail in unpredictable ways, including hanging indefinitely rather than returning an error. A single hanging tool call blocks the entire agent response and holds server resources for the duration of the hang.

**How to fix:**
Set explicit timeouts on all external tool calls and HTTP clients. Handle `TimeoutError` exceptions gracefully, log the timeout, and return a structured error response that allows the agent to reason about the failure.

```python
import httpx

async def web_search_tool(query: str) -> str:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(SEARCH_API, params={"q": query})
        response.raise_for_status()
        return response.json()
```

---

### REL-004 — No Error Handling on Tool Failures
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
Tool call failures — exceptions, HTTP errors, malformed responses, empty results — are not caught and handled gracefully. Unhandled exceptions propagate up and cause the entire agent run to fail rather than allowing recovery.

**Why it matters:**
External tools fail regularly — APIs go down, rate limits are hit, network requests timeout, and services return unexpected formats. An agent that doesn't handle these gracefully crashes on routine infrastructure fluctuations.

**How to fix:**
Wrap all tool calls in try-except blocks. Catch specific exception types rather than bare `except`. Return structured error responses that provide the agent enough context to attempt an alternative approach or inform the user appropriately.

---

### REL-005 — No Retry Logic for Transient Failures
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
Failed API calls or tool invocations are not retried. Transient network errors, temporary rate limits, and brief service unavailability cause immediate permanent failures rather than short-delay recovery.

**Why it matters:**
The vast majority of API failures are transient — a brief network hiccup, a momentary rate limit, a service restart. A simple retry with exponential backoff resolves most of them within a few seconds without any user impact.

**How to fix:**
Implement exponential backoff retry logic for all external service calls. Distinguish retryable errors (429, 503, network timeout) from non-retryable ones (400, 401, 404). Cap retries at 3–5 attempts with jitter.

```python
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import httpx

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.TimeoutException, httpx.HTTPStatusError))
)
async def call_api_with_retry(url: str):
    ...
```

---

### REL-006 — No Fallback for Failed Tool Calls
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
When a tool call fails after all retries are exhausted, the agent has no fallback behavior — it simply reports failure to the user with no alternative path, partial result, or graceful degradation.

**Why it matters:**
Users expect agents to be helpful even when individual components are temporarily unavailable. A thoughtful fallback — using a cached result, an alternative data source, a simpler approach, or a clear explanation of what failed and why — maintains a useful experience under failure conditions.

**How to fix:**
Define explicit fallback strategies for each critical tool. Document these in tool configuration. Implement them in error handling logic. Test fallback paths as part of your regular test suite.

---

### REL-007 — Agent State Not Persisted Across Process Restarts
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
Agent state — conversation history, task progress, in-flight operation status, accumulated context — is stored only in process memory and is completely lost if the agent process restarts for any reason.

**Why it matters:**
Container restarts, rolling deployments, scaling events, and application crashes are routine in production. Losing agent state silently means users lose conversation context mid-session and in-progress multi-step tasks fail without explanation or recovery.

**How to fix:**
Persist agent state to an external store after every meaningful state change. Restore state from the external store on process startup. Choose a store with appropriate durability for your use case (Redis with persistence, PostgreSQL, DynamoDB).

---

### REL-008 — No Load Testing Evidence
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
There is no evidence of load testing in the project — no load test scripts, no performance benchmark results, no documented capacity limits. The agent's behavior under concurrent load is unknown.

**Why it matters:**
Agents that perform perfectly for a single user frequently exhibit resource contention, rate limit cascades, memory pressure, and latency spikes under realistic concurrent load. These failures only manifest at scale and cannot be predicted from single-user testing.

**How to fix:**
Run load tests before the first production launch and after any significant architectural change. Simulate your expected peak concurrent user count times a 2x safety factor. Measure and document response time percentiles, error rates, and resource utilization under load.

---

### REL-009 — No Circuit Breaker for External Dependencies
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
Calls to external APIs or services have no circuit breaker pattern implemented. When a dependency begins degrading, the agent continues sending requests at full rate, amplifying the problem for the degraded service and propagating failures.

**Why it matters:**
Without circuit breakers, a degraded external service causes cascading failures: requests queue up, timeouts accumulate, thread pools exhaust, and the failure propagates from one failing dependency to the entire agent. A circuit breaker detects the failure, stops sending requests, and allows the service to recover.

**How to fix:**
Implement the circuit breaker pattern for all external dependencies. Configure appropriate failure thresholds and recovery timeouts based on each dependency's characteristics.

---

### REL-010 — Long-Running Tasks Execute Synchronously
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
Long-running agent tasks — research tasks, batch processing, multi-step automation — execute synchronously within the HTTP request-response cycle, blocking the connection for their entire duration.

**Why it matters:**
Long synchronous operations block HTTP server threads, exceed client timeout limits (typically 30–60 seconds), prevent the server from handling other requests efficiently, and create a poor user experience for any task taking more than a few seconds.

**How to fix:**
Use an async task queue (Celery, RQ, Bull, AWS SQS + Lambda) for operations expected to take more than 5 seconds. Return a `202 Accepted` with a task ID immediately. Allow clients to poll a status endpoint or receive a webhook on completion.

---

### REL-011 — No Checkpointing for Multi-Step Tasks
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
Complex multi-step agent tasks execute as a single atomic unit with no intermediate checkpointing. A failure at any point requires complete restart from the beginning, losing all work completed prior to the failure.

**Why it matters:**
Complex tasks involving many tool calls, long research chains, or multi-document processing can fail at any step for transient reasons. Without checkpoints, partial failures waste significant compute, API credits, and user time.

**How to fix:**
Implement checkpointing after each significant step in multi-step tasks. Persist checkpoint state to an external store. Design task execution to resume from the last successful checkpoint rather than restarting from scratch.

---

### REL-012 — Memory Backend Configured Without Persistence
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
The agent's primary memory backend — commonly Redis — is running without persistence configuration (no AOF, no RDB snapshots), meaning all stored memories, session context, and cached data are lost on any backend restart.

**Why it matters:**
A non-persistent memory backend is effectively volatile storage. Any planned restart (maintenance, upgrade, deployment) or unplanned restart (crash, OOM kill) wipes all agent memories, destroying learned context, user preferences, and session state.

**How to fix:**
Enable persistence on your memory backend. For Redis, enable AOF (Append-Only File) for maximum durability or RDB snapshots for balanced performance. Regularly back up memory data in production. Consider managed services with built-in persistence guarantees.

---

### REL-013 — Single Instance with No Redundancy
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
The agent is deployed as a single instance with no redundant instances, load balancing, or automatic failover. Any failure — crash, OOM, deployment — results in complete service unavailability.

**Why it matters:**
Single-instance deployments have a 100% downtime exposure on any failure event. Even a rolling deployment causes a brief outage window. Production agents serving real users require at minimum two instances behind a load balancer.

**How to fix:**
Deploy a minimum of two agent instances behind a load balancer. Configure health checks so the load balancer automatically routes around unhealthy instances. Use rolling deployments to maintain availability during updates.

---

### REL-014 — No Failure Injection or Chaos Testing
**Severity:** `warn`  
**Category:** Reliability

**What it detects:**
There is no evidence of controlled failure injection testing, chaos engineering, or resilience testing in the project. The agent's actual behavior under dependency failures, resource constraints, and network degradation is completely untested.

**Why it matters:**
Resilience can only be verified through testing. Untested failure paths fail in production at the worst possible moment — under high load, during incidents — in ways that are unfamiliar to the on-call team because they have never been practiced.

**How to fix:**
Introduce controlled failure injection: simulate LLM API timeouts, memory backend outages, high latency on tool calls, and network packet loss. Verify the agent degrades gracefully and recovers correctly under each failure mode. Run failure injection tests regularly, not just at launch.

---

## Observability — OBS (12 rules)

---

### OBS-001 — No Structured Logging
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
The agent uses unstructured log output — bare `print()` statements, unformatted string concatenation, or plain text log lines — rather than structured JSON-formatted logging with consistent, queryable fields.

**Why it matters:**
Unstructured logs cannot be reliably parsed, searched, filtered, or aggregated by log management systems (Datadog, CloudWatch, Splunk, Loki). Debugging a production issue by grepping through unstructured text is slow, error-prone, and does not scale.

**How to fix:**
Adopt a structured logging library and output JSON-formatted log entries. Include consistent fields: `timestamp`, `level`, `message`, `agent_id`, `session_id`, `request_id`, `tool_name`, `duration_ms`, `error` (if applicable).

```python
import structlog

logger = structlog.get_logger()

logger.info(
    "tool_call_completed",
    tool_name="web_search",
    query=query,
    duration_ms=elapsed,
    result_count=len(results),
    session_id=session_id,
)
```

---

### OBS-002 — No Distributed Tracing
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
The agent has no distributed tracing instrumentation — no OpenTelemetry, Jaeger, Zipkin, Langfuse, Langsmith, or equivalent. Individual steps in multi-step agent runs cannot be traced, timed, or correlated end-to-end.

**Why it matters:**
Without traces, understanding where time is spent across a multi-step agent run is impossible. You cannot identify which specific tool calls are slow, where failures originate in complex reasoning chains, or how latency distributes across components.

**How to fix:**
Instrument the agent with OpenTelemetry. Create spans for each LLM invocation, tool call, memory operation, and external API call. Export traces to your observability backend. Use trace IDs to correlate logs with traces.

```python
from opentelemetry import trace

tracer = trace.get_tracer("agent-doctor")

with tracer.start_as_current_span("tool_call") as span:
    span.set_attribute("tool.name", tool_name)
    span.set_attribute("tool.input", str(tool_input))
    result = tool.run(tool_input)
    span.set_attribute("tool.output_length", len(str(result)))
```

---

### OBS-003 — No Alerting on Tool Failure Rate
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
Tool failures are captured in logs or metrics, but no alerting rules are configured to notify operators when individual tool failure rates exceed acceptable thresholds.

**Why it matters:**
Silent tool failures degrade agent quality and usefulness without triggering any operational response. By the time degradation is noticed through user complaints, a significant number of users have already been affected and the root cause may have been obscured by time.

**How to fix:**
Define acceptable failure rate thresholds for each tool (e.g., < 5% over a 5-minute window). Configure alerts that fire when thresholds are breached. Route critical tool failure alerts to on-call. Include tool failure rate in your agent's SLO tracking.

---

### OBS-004 — No Error Tracking Integration
**Severity:** `error`  
**Category:** Observability

**What it detects:**
The agent has no error tracking service integrated — no Sentry, Datadog Error Tracking, Rollbar, Bugsnag, or equivalent — in the production environment. Unhandled exceptions produce no structured alert and no actionable context for developers.

**Why it matters:**
Without error tracking, exceptions in production are silent. Bugs that would be immediately visible in development — with full stack traces, local variables, and reproduction context — go undetected in production until a user explicitly reports them or monitoring surfaces an error rate spike.

**How to fix:**
Integrate an error tracking service and configure it to capture all unhandled exceptions with: full stack trace, agent version, session ID, request ID, the tool being called at time of failure, and relevant environment metadata.

---

### OBS-005 — No LLM Cost or Token Usage Metrics
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
The agent does not track or export metrics on LLM API calls: input tokens, output tokens, total cost per call, cumulative cost, latency, or model version used.

**Why it matters:**
LLM API costs and latency are the primary operational economics of agent deployment. Without metrics, cost overruns go undetected until the monthly bill arrives, performance regressions are invisible, and capacity planning is impossible.

**How to fix:**
Track and export these metrics for every LLM call: `prompt_tokens`, `completion_tokens`, `total_tokens`, `estimated_cost_usd`, `latency_ms`, `model_name`, `success`. Aggregate them per session, user, and agent version. Build a cost dashboard.

---

### OBS-006 — No Request Trace ID Propagation
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
Agent requests do not generate or propagate a unique trace ID through all associated log entries, tool calls, LLM invocations, and sub-agent calls for that single user interaction.

**Why it matters:**
Without request-scoped trace IDs, reconstructing the sequence of events for a specific user interaction from production logs requires correlating entries by timestamp — a slow, unreliable process that makes debugging incidents significantly harder than necessary.

**How to fix:**
Generate a UUID at the entry point of each request. Store it in a context variable (Python `contextvars`, Node `AsyncLocalStorage`). Include it in every log entry, span, and external call header for the duration of that request.

---

### OBS-007 — No Operational Dashboard
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
The agent has no operational monitoring dashboard showing real-time and historical views of key operational metrics: request volume, error rate, latency percentiles, token usage, tool call success rates, and overall health score.

**Why it matters:**
Operators need continuous visibility into the agent's behavior and health. Without a dashboard, the first indication of a degrading agent is a user complaint — long after the problem began. Dashboards enable proactive detection and faster incident response.

**How to fix:**
Build a dashboard in your observability platform (Grafana, Datadog, CloudWatch) covering: requests per second, P50/P95/P99 latency, error rate, token consumption rate, tool success/failure rates, cost per hour, and active session count.

---

### OBS-008 — Log Level Not Runtime-Configurable
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
The agent's logging verbosity is hardcoded in the application code or build artifact and cannot be adjusted without a code change and redeployment.

**Why it matters:**
During incidents, operators need to immediately increase log verbosity to capture detailed diagnostic information — tool inputs/outputs, intermediate reasoning steps, memory operations. If this requires a redeployment, critical debugging time is lost during an active incident.

**How to fix:**
Make log level configurable via environment variable read at startup. Optionally expose a runtime API endpoint that allows changing the log level without restarting the process (admin-authenticated, rate-limited).

---

### OBS-009 — Memory Operations Not Traced or Logged
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
Read and write operations to the agent's memory backend are not included in log output or distributed traces. Memory behavior during agent runs is completely opaque to operators and developers.

**Why it matters:**
Memory operations are a first-class part of agent behavior — what the agent remembers, retrieves, and stores directly influences its responses. Without logging memory operations, it's impossible to audit agent memory behavior, debug memory-related issues, or understand why an agent responded the way it did.

**How to fix:**
Log all memory reads and writes with: memory key or vector similarity score, operation type (read/write/delete), data size, timestamp, and session context. Include memory operations as child spans in distributed traces.

---

### OBS-010 — No SLO or SLA Defined
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
The agent has no formally defined Service Level Objectives (availability target, latency target, error rate budget) and therefore no SLO-based alerting or burn rate monitoring.

**Why it matters:**
Without SLOs, there is no objective, measurable standard for what "acceptable performance" means. Teams cannot determine whether current performance is acceptable, whether an incident requires escalation, or whether improvements are making a meaningful difference.

**How to fix:**
Define concrete SLOs for your agent: target availability (e.g., 99.9%), latency targets (P99 < 3 seconds), and error rate budget (< 1% of requests). Configure SLO burn rate alerts that fire when error budget consumption rate exceeds sustainable levels.

---

### OBS-011 — No LLM Cost Budget or Alerting
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
There is no cost tracking, budget threshold configuration, or alerting for LLM API spending. There is no mechanism to detect or prevent cost overruns before they materialize on the monthly invoice.

**Why it matters:**
LLM API costs can spike dramatically and unexpectedly from agent loops, unusual request patterns, prompt engineering changes that increase token counts, or sudden traffic increases. Without budget alerts, runaway spend continues unchecked until billing review.

**How to fix:**
Track cumulative LLM costs per request and aggregate over time. Set budget alerts at 50%, 80%, and 100% of expected monthly cost. Implement hard spending caps for non-production environments. Set per-user or per-session token budgets for production agents with user-facing surfaces.

---

### OBS-012 — No User Feedback Signal Collected
**Severity:** `warn`  
**Category:** Observability

**What it detects:**
The agent collects no explicit user feedback — thumbs up/down ratings, star ratings, correction submissions, or satisfaction signals — that could be used to evaluate actual response quality from the user's perspective.

**Why it matters:**
Automated metrics (latency, error rate, token count) capture operational health but not response quality. A fast, error-free agent that consistently gives wrong or unhelpful answers looks healthy by automated metrics but is failing its users. User feedback is the only direct quality signal.

**How to fix:**
Add a lightweight, low-friction feedback mechanism to all user-facing surfaces. Log feedback with the complete request and response context. Use feedback data to identify systematically poor response categories, prioritize improvements, and evaluate the impact of changes.

---

## Compliance — CMP (11 rules)

---

### CMP-001 — OWASP Agentic Top 10 Violation
**Severity:** `error`  
**Category:** Compliance

**What it detects:**
The agent has one or more violations of the OWASP Top 10 for Agentic Applications — the industry's primary catalogued security standard for AI agent systems, covering the most critical and commonly exploited vulnerability categories.

**Why it matters:**
OWASP Agentic Top 10 distills real-world attack patterns validated across the security community into an actionable checklist. Violations indicate known, documented attack vectors that have already caused incidents in deployed agent systems.

**How to fix:**
Review the specific OWASP category flagged — each maps to one or more SEC-* rules in this reference with specific remediation guidance. Consult the full OWASP LLM Top 10 documentation for comprehensive remediation patterns. Treat OWASP violations as blocking issues before any production deployment.

---

### CMP-002 — No Data Retention or Deletion Policy
**Severity:** `warn`  
**Category:** Compliance

**What it detects:**
The agent stores user data — conversation history, memory entries, uploaded files, session logs — indefinitely with no automated retention limits, scheduled deletion, or user-initiated deletion capability.

**Why it matters:**
GDPR (EU), CCPA (California), PIPEDA (Canada), LGPD (Brazil), and equivalent regulations in most jurisdictions require that personal data be retained only as long as necessary for its stated purpose and deleted on user request. Indefinite retention creates direct regulatory liability and compounds the impact of any future data breach.

**How to fix:**
Define and document a data retention policy specifying maximum retention periods for each data category. Implement automated deletion at retention period expiry. Build a user data deletion endpoint that purges all data associated with a user identifier across all storage systems within 30 days of request.

---

### CMP-003 — Agent Output Not Validated Before User Delivery
**Severity:** `warn`  
**Category:** Compliance

**What it detects:**
Agent-generated responses are delivered directly to end users without passing through an output validation layer that checks for harmful content, policy violations, factual claims that require verification, or responses that fall outside the agent's defined scope.

**Why it matters:**
Language models produce harmful, biased, or policy-violating content even with well-crafted system prompts and careful fine-tuning. An output validator is the final safety net between model generation and user exposure. Its absence is a systematic gap in the safety architecture.

**How to fix:**
Implement an output validation layer using a content moderation API (OpenAI Moderation, Perspective API), a custom classification model, or rule-based filters. Reject or rewrite responses that fail validation. Log all rejections for review and threshold calibration.

---

### CMP-004 — No GDPR Consent Mechanism
**Severity:** `warn`  
**Category:** Compliance

**What it detects:**
The agent processes personal data of users in EU/EEA jurisdictions without a documented consent collection mechanism, persisted consent records with timestamps, or a workflow for processing consent withdrawal.

**Why it matters:**
GDPR Article 6 requires a valid lawful basis for personal data processing — typically explicit consent for AI-driven processing. Operating without consent collection exposes the organization to GDPR enforcement action, fines of up to 4% of global annual revenue, and reputational damage.

**How to fix:**
Implement consent collection at user onboarding. Store consent records with timestamps, the specific consent scope, and the version of the privacy notice accepted. Build consent withdrawal workflows. Engage legal counsel to confirm your specific lawful basis and consent requirements.

---

### CMP-005 — No HIPAA Technical Safeguards for Health Data
**Severity:** `error`  
**Category:** Compliance

**What it detects:**
The agent processes, transmits, or stores Protected Health Information (PHI) without the technical safeguards required by HIPAA: encryption at rest and in transit, access controls and audit logs, automatic logoff, and documented Business Associate Agreements with all vendors.

**Why it matters:**
HIPAA violations carry civil penalties ranging from $100 to $50,000 per violation with annual maximums of $1.9 million per category, plus potential criminal liability. AI agents handling health data without proper HIPAA controls are a significant legal and financial risk.

**How to fix:**
Never build a HIPAA-compliant system without dedicated compliance expertise. Engage a HIPAA compliance specialist. At minimum: encrypt all PHI at rest (AES-256) and in transit (TLS 1.2+), implement comprehensive access logging, ensure all vendors (including LLM providers) have signed BAAs, and conduct a formal Security Risk Analysis.

---

### CMP-006 — No AI System Disclosure to Users
**Severity:** `warn`  
**Category:** Compliance

**What it detects:**
Users interacting with the agent are not informed they are communicating with an AI system. There is no disclosure in the onboarding flow, user interface, or agent persona design. The agent may actively present itself as human.

**Why it matters:**
The EU AI Act (Article 52) requires disclosure for AI systems designed to interact with natural persons. FTC guidelines in the US require disclosure of AI in consumer-facing interactions. Many US states have enacted or are enacting chatbot disclosure laws. Non-disclosure also fundamentally erodes user trust when discovered.

**How to fix:**
Add unambiguous AI disclosure in: the onboarding flow before first interaction, persistent UI indicators during conversations, the agent's system prompt (so it accurately identifies itself when asked), and any marketing materials that describe the product.

---

### CMP-007 — No Model Card or Technical Documentation
**Severity:** `warn`  
**Category:** Compliance

**What it detects:**
The agent has no model card, system card, or equivalent technical documentation describing its capabilities, limitations, intended use cases, out-of-scope uses, known failure modes, evaluation methodology, and training data (if fine-tuned).

**Why it matters:**
The EU AI Act requires technical documentation for all AI systems, with more extensive requirements for high-risk systems. NIST AI RMF, ISO/IEC 42001, and enterprise AI governance frameworks all require capability and limitation documentation. Lack of documentation is also an operational risk — teams cannot make informed decisions about agent deployment without it.

**How to fix:**
Create a model card covering: intended use cases and target users, known limitations and failure modes, out-of-scope uses and misuse risks, performance evaluation results across relevant populations, training data description (for fine-tuned models), and human oversight recommendations.

---

### CMP-008 — No Human Oversight for High-Stakes Decisions
**Severity:** `error`  
**Category:** Compliance

**What it detects:**
The agent makes or substantially influences high-stakes decisions — financial approvals, medical recommendations, legal advice, employment decisions, credit determinations — without any human review, escalation path, or override mechanism.

**Why it matters:**
Fully automated AI decision-making in high-stakes domains is prohibited or heavily restricted under EU AI Act (classified as high-risk AI), US sector-specific regulations (ECOA, FCRA for credit), employment discrimination law, and medical practice regulations. It also creates enormous liability exposure when the agent makes a consequential error.

**How to fix:**
Implement mandatory human-in-the-loop review for all high-stakes outputs before they are acted upon. Design clear escalation paths for uncertain or borderline cases. Log all human review decisions. Provide users with meaningful explanation of AI-influenced decisions and genuine recourse mechanisms.

---

### CMP-009 — No PCI-DSS Controls for Payment Card Data
**Severity:** `error`  
**Category:** Compliance

**What it detects:**
The agent has access to, processes, or transmits payment card data (Primary Account Numbers, CVVs, expiration dates) without PCI-DSS required controls: tokenization, encrypted transmission over TLS, restricted access via least privilege, and detailed access audit logging.

**Why it matters:**
PCI-DSS non-compliance for organizations that process payment card data results in fines from $5,000 to $100,000 per month from card networks, potential loss of payment processing privileges, mandatory forensic audits after any breach, and significant breach liability.

**How to fix:**
Minimize agent exposure to payment card data as much as possible — ideally to zero through tokenization. Use payment processors (Stripe, Braintree) that handle card data directly so your agent never touches raw card numbers. If unavoidable, engage a Qualified Security Assessor (QSA) for formal PCI-DSS scoping and assessment.

---

### CMP-010 — No Bias Testing or Fairness Evaluation
**Severity:** `warn`  
**Category:** Compliance

**What it detects:**
The agent has not been evaluated for demographic bias, disparate impact across user groups, or fairness across protected characteristics. There is no evidence of bias testing, fairness evaluation, or disparate impact analysis in the project.

**Why it matters:**
AI systems that produce biased outputs create direct legal liability under anti-discrimination law (Title VII, ECOA, Fair Housing Act in the US; equivalent EU legislation), cause regulatory scrutiny, and cause measurable harm to affected user groups. The EU AI Act explicitly requires bias assessment and ongoing monitoring for high-risk AI systems.

**How to fix:**
Conduct bias testing across demographic dimensions relevant to your use case before deployment. Document findings, including positive results. Implement bias mitigations where disparities are identified and re-test. Include fairness metrics in your ongoing monitoring and run bias evaluations after any significant model or prompt change.

---

### CMP-011 — No AI Incident Response Plan
**Severity:** `warn`  
**Category:** Compliance

**What it detects:**
The organization has no documented incident response plan specific to AI agent failures — covering how to respond to harmful output generation, data breaches via the agent, agent misuse by users, model behavior regressions, and required regulatory notifications.

**Why it matters:**
AI incidents differ fundamentally from traditional software incidents: they may require model rollback rather than code rollback, output review at scale, communication to affected users, and regulatory notification within strict timeframes (72 hours under GDPR for data breaches). Standard incident response plans written for software systems do not account for AI-specific failure modes.

**How to fix:**
Develop an AI-specific incident response playbook covering: incident classification criteria for AI failures, immediate containment actions (rate limiting, agent shutdown, model rollback), output review procedures for harmful content generation, regulatory notification timelines and contacts, user communication templates, and post-incident root cause analysis for AI systems. Conduct tabletop exercises for the most likely incident scenarios before they occur.

---

> **Total rules: 82**  
> SEC: 18 · CFG: 14 · DEP: 13 · REL: 14 · OBS: 12 · CMP: 11

---

*For questions, corrections, or new rule proposals, open an issue or pull request on GitHub.*