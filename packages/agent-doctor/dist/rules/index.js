"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_RULES = void 0;
exports.getApplicableRules = getApplicableRules;
// Security
const sec_001_1 = require("./security/sec-001");
const sec_002_1 = require("./security/sec-002");
const sec_003_1 = require("./security/sec-003");
const sec_004_1 = require("./security/sec-004");
const sec_005_1 = require("./security/sec-005");
const sec_006_1 = require("./security/sec-006");
const sec_007_1 = require("./security/sec-007");
const sec_008_1 = require("./security/sec-008");
const sec_009_1 = require("./security/sec-009");
const sec_010_1 = require("./security/sec-010");
const sec_011_1 = require("./security/sec-011");
const sec_012_1 = require("./security/sec-012");
const sec_013_1 = require("./security/sec-013");
const sec_014_1 = require("./security/sec-014");
const sec_015_1 = require("./security/sec-015");
const sec_016_1 = require("./security/sec-016");
const sec_017_1 = require("./security/sec-017");
const sec_018_1 = require("./security/sec-018");
// Config
const cfg_001_1 = require("./config/cfg-001");
const cfg_002_1 = require("./config/cfg-002");
const cfg_003_1 = require("./config/cfg-003");
const cfg_004_1 = require("./config/cfg-004");
const cfg_005_1 = require("./config/cfg-005");
const cfg_006_1 = require("./config/cfg-006");
const cfg_007_1 = require("./config/cfg-007");
const cfg_008_1 = require("./config/cfg-008");
const cfg_009_1 = require("./config/cfg-009");
const cfg_010_1 = require("./config/cfg-010");
const cfg_011_1 = require("./config/cfg-011");
const cfg_012_1 = require("./config/cfg-012");
const cfg_013_1 = require("./config/cfg-013");
const cfg_014_1 = require("./config/cfg-014");
// Deployment
const dep_001_1 = require("./deployment/dep-001");
const dep_002_1 = require("./deployment/dep-002");
const dep_003_1 = require("./deployment/dep-003");
const dep_004_1 = require("./deployment/dep-004");
const dep_005_1 = require("./deployment/dep-005");
const dep_006_1 = require("./deployment/dep-006");
const dep_007_1 = require("./deployment/dep-007");
const dep_008_1 = require("./deployment/dep-008");
const dep_009_1 = require("./deployment/dep-009");
const dep_010_1 = require("./deployment/dep-010");
const dep_011_1 = require("./deployment/dep-011");
const dep_012_1 = require("./deployment/dep-012");
const dep_013_1 = require("./deployment/dep-013");
// Reliability
const rel_001_1 = require("./reliability/rel-001");
const rel_002_1 = require("./reliability/rel-002");
const rel_003_1 = require("./reliability/rel-003");
const rel_004_1 = require("./reliability/rel-004");
const rel_005_1 = require("./reliability/rel-005");
const rel_006_1 = require("./reliability/rel-006");
const rel_007_1 = require("./reliability/rel-007");
const rel_008_1 = require("./reliability/rel-008");
const rel_009_1 = require("./reliability/rel-009");
const rel_010_1 = require("./reliability/rel-010");
const rel_011_1 = require("./reliability/rel-011");
const rel_012_1 = require("./reliability/rel-012");
const rel_013_1 = require("./reliability/rel-013");
const rel_014_1 = require("./reliability/rel-014");
// Observability
const obs_001_1 = require("./observability/obs-001");
const obs_002_1 = require("./observability/obs-002");
const obs_003_1 = require("./observability/obs-003");
const obs_004_1 = require("./observability/obs-004");
const obs_005_1 = require("./observability/obs-005");
const obs_006_1 = require("./observability/obs-006");
const obs_007_1 = require("./observability/obs-007");
const obs_008_1 = require("./observability/obs-008");
const obs_009_1 = require("./observability/obs-009");
const obs_010_1 = require("./observability/obs-010");
const obs_011_1 = require("./observability/obs-011");
const obs_012_1 = require("./observability/obs-012");
// Compliance
const cmp_001_1 = require("./compliance/cmp-001");
const cmp_002_1 = require("./compliance/cmp-002");
const cmp_003_1 = require("./compliance/cmp-003");
const cmp_004_1 = require("./compliance/cmp-004");
const cmp_005_1 = require("./compliance/cmp-005");
const cmp_006_1 = require("./compliance/cmp-006");
const cmp_007_1 = require("./compliance/cmp-007");
const cmp_008_1 = require("./compliance/cmp-008");
const cmp_009_1 = require("./compliance/cmp-009");
const cmp_010_1 = require("./compliance/cmp-010");
const cmp_011_1 = require("./compliance/cmp-011");
exports.ALL_RULES = [
    // Security (18)
    sec_001_1.sec001, sec_002_1.sec002, sec_003_1.sec003, sec_004_1.sec004, sec_005_1.sec005, sec_006_1.sec006,
    sec_007_1.sec007, sec_008_1.sec008, sec_009_1.sec009, sec_010_1.sec010, sec_011_1.sec011, sec_012_1.sec012,
    sec_013_1.sec013, sec_014_1.sec014, sec_015_1.sec015, sec_016_1.sec016, sec_017_1.sec017, sec_018_1.sec018,
    // Config (14)
    cfg_001_1.cfg001, cfg_002_1.cfg002, cfg_003_1.cfg003, cfg_004_1.cfg004, cfg_005_1.cfg005, cfg_006_1.cfg006,
    cfg_007_1.cfg007, cfg_008_1.cfg008, cfg_009_1.cfg009, cfg_010_1.cfg010, cfg_011_1.cfg011, cfg_012_1.cfg012,
    cfg_013_1.cfg013, cfg_014_1.cfg014,
    // Deployment (13)
    dep_001_1.dep001, dep_002_1.dep002, dep_003_1.dep003, dep_004_1.dep004, dep_005_1.dep005, dep_006_1.dep006,
    dep_007_1.dep007, dep_008_1.dep008, dep_009_1.dep009, dep_010_1.dep010, dep_011_1.dep011, dep_012_1.dep012,
    dep_013_1.dep013,
    // Reliability (14)
    rel_001_1.rel001, rel_002_1.rel002, rel_003_1.rel003, rel_004_1.rel004, rel_005_1.rel005, rel_006_1.rel006,
    rel_007_1.rel007, rel_008_1.rel008, rel_009_1.rel009, rel_010_1.rel010, rel_011_1.rel011, rel_012_1.rel012,
    rel_013_1.rel013, rel_014_1.rel014,
    // Observability (12)
    obs_001_1.obs001, obs_002_1.obs002, obs_003_1.obs003, obs_004_1.obs004, obs_005_1.obs005, obs_006_1.obs006,
    obs_007_1.obs007, obs_008_1.obs008, obs_009_1.obs009, obs_010_1.obs010, obs_011_1.obs011, obs_012_1.obs012,
    // Compliance (11)
    cmp_001_1.cmp001, cmp_002_1.cmp002, cmp_003_1.cmp003, cmp_004_1.cmp004, cmp_005_1.cmp005, cmp_006_1.cmp006,
    cmp_007_1.cmp007, cmp_008_1.cmp008, cmp_009_1.cmp009, cmp_010_1.cmp010, cmp_011_1.cmp011,
];
function getApplicableRules(_projectInfo, config) {
    return exports.ALL_RULES.filter((r) => !config.ignore.rules.includes(r.id));
}
//# sourceMappingURL=index.js.map