import type { Rule } from "../types";
import type { ProjectInfo, AgentDoctorConfig } from "../types";

// Security
import { sec001 } from "./security/sec-001";
import { sec002 } from "./security/sec-002";
import { sec003 } from "./security/sec-003";
import { sec004 } from "./security/sec-004";
import { sec005 } from "./security/sec-005";
import { sec006 } from "./security/sec-006";
import { sec007 } from "./security/sec-007";
import { sec008 } from "./security/sec-008";
import { sec009 } from "./security/sec-009";
import { sec010 } from "./security/sec-010";
import { sec011 } from "./security/sec-011";
import { sec012 } from "./security/sec-012";
import { sec013 } from "./security/sec-013";
import { sec014 } from "./security/sec-014";
import { sec015 } from "./security/sec-015";
import { sec016 } from "./security/sec-016";
import { sec017 } from "./security/sec-017";
import { sec018 } from "./security/sec-018";

// Config
import { cfg001 } from "./config/cfg-001";
import { cfg002 } from "./config/cfg-002";
import { cfg003 } from "./config/cfg-003";
import { cfg004 } from "./config/cfg-004";
import { cfg005 } from "./config/cfg-005";
import { cfg006 } from "./config/cfg-006";
import { cfg007 } from "./config/cfg-007";
import { cfg008 } from "./config/cfg-008";
import { cfg009 } from "./config/cfg-009";
import { cfg010 } from "./config/cfg-010";
import { cfg011 } from "./config/cfg-011";
import { cfg012 } from "./config/cfg-012";
import { cfg013 } from "./config/cfg-013";
import { cfg014 } from "./config/cfg-014";

// Deployment
import { dep001 } from "./deployment/dep-001";
import { dep002 } from "./deployment/dep-002";
import { dep003 } from "./deployment/dep-003";
import { dep004 } from "./deployment/dep-004";
import { dep005 } from "./deployment/dep-005";
import { dep006 } from "./deployment/dep-006";
import { dep007 } from "./deployment/dep-007";
import { dep008 } from "./deployment/dep-008";
import { dep009 } from "./deployment/dep-009";
import { dep010 } from "./deployment/dep-010";
import { dep011 } from "./deployment/dep-011";
import { dep012 } from "./deployment/dep-012";
import { dep013 } from "./deployment/dep-013";

// Reliability
import { rel001 } from "./reliability/rel-001";
import { rel002 } from "./reliability/rel-002";
import { rel003 } from "./reliability/rel-003";
import { rel004 } from "./reliability/rel-004";
import { rel005 } from "./reliability/rel-005";
import { rel006 } from "./reliability/rel-006";
import { rel007 } from "./reliability/rel-007";
import { rel008 } from "./reliability/rel-008";
import { rel009 } from "./reliability/rel-009";
import { rel010 } from "./reliability/rel-010";
import { rel011 } from "./reliability/rel-011";
import { rel012 } from "./reliability/rel-012";
import { rel013 } from "./reliability/rel-013";
import { rel014 } from "./reliability/rel-014";

// Observability
import { obs001 } from "./observability/obs-001";
import { obs002 } from "./observability/obs-002";
import { obs003 } from "./observability/obs-003";
import { obs004 } from "./observability/obs-004";
import { obs005 } from "./observability/obs-005";
import { obs006 } from "./observability/obs-006";
import { obs007 } from "./observability/obs-007";
import { obs008 } from "./observability/obs-008";
import { obs009 } from "./observability/obs-009";
import { obs010 } from "./observability/obs-010";
import { obs011 } from "./observability/obs-011";
import { obs012 } from "./observability/obs-012";

// Compliance
import { cmp001 } from "./compliance/cmp-001";
import { cmp002 } from "./compliance/cmp-002";
import { cmp003 } from "./compliance/cmp-003";
import { cmp004 } from "./compliance/cmp-004";
import { cmp005 } from "./compliance/cmp-005";
import { cmp006 } from "./compliance/cmp-006";
import { cmp007 } from "./compliance/cmp-007";
import { cmp008 } from "./compliance/cmp-008";
import { cmp009 } from "./compliance/cmp-009";
import { cmp010 } from "./compliance/cmp-010";
import { cmp011 } from "./compliance/cmp-011";

export const ALL_RULES: Rule[] = [
  // Security (18)
  sec001, sec002, sec003, sec004, sec005, sec006,
  sec007, sec008, sec009, sec010, sec011, sec012,
  sec013, sec014, sec015, sec016, sec017, sec018,
  // Config (14)
  cfg001, cfg002, cfg003, cfg004, cfg005, cfg006,
  cfg007, cfg008, cfg009, cfg010, cfg011, cfg012,
  cfg013, cfg014,
  // Deployment (13)
  dep001, dep002, dep003, dep004, dep005, dep006,
  dep007, dep008, dep009, dep010, dep011, dep012,
  dep013,
  // Reliability (14)
  rel001, rel002, rel003, rel004, rel005, rel006,
  rel007, rel008, rel009, rel010, rel011, rel012,
  rel013, rel014,
  // Observability (12)
  obs001, obs002, obs003, obs004, obs005, obs006,
  obs007, obs008, obs009, obs010, obs011, obs012,
  // Compliance (11)
  cmp001, cmp002, cmp003, cmp004, cmp005, cmp006,
  cmp007, cmp008, cmp009, cmp010, cmp011,
];

export function getApplicableRules(
  _projectInfo: ProjectInfo,
  config: AgentDoctorConfig,
  _deepAnalysis: boolean = false
): Rule[] {
  return ALL_RULES.filter((r) => !config.ignore.rules.includes(r.id));
}
