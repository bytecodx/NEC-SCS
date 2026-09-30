// scripts/test-automation.mjs
// Automated verification test suite for Nandha Engineering College (NEC)

const BASE_URL = "http://127.0.0.1:3000";

const COOKIES = {
  FACULTY: "campuscred_session_user_id=bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01",
  ADMIN: "campuscred_session_user_id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  HOD: "campuscred_session_user_id=bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03",
  STUDENT: "campuscred_session_user_id=cccccccc-cccc-cccc-cccc-cccccccccc01",
};

let passed = 0;
let failed = 0;

function report(testName, success, details = "") {
  if (success) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName} - ${details}`);
    failed++;
  }
}

async function runTests() {
  console.log("==========================================================");
  console.log("🚀 STARTING AUTOMATED TEST SUITE: NANDHA ENGINEERING COLLEGE");
  console.log(`Target: ${BASE_URL}`);
  console.log("==========================================================\n");

  // TEST 1: PWA Manifest
  try {
    const res = await fetch(`${BASE_URL}/manifest.json`);
    const data = await res.json();
    const hasName = data.name.includes("Nandha Engineering College");
    report("PWA Manifest includes Nandha Engineering College", res.ok && hasName, `Status: ${res.status}, Name: ${data.name}`);
  } catch (err) {
    report("PWA Manifest", false, err.message);
  }

  // TEST 2: Service Worker
  try {
    const res = await fetch(`${BASE_URL}/sw.js`);
    report("Service Worker sw.js active and reachable", res.status === 200, `Status: ${res.status}`);
  } catch (err) {
    report("Service Worker sw.js", false, err.message);
  }

  // TEST 3: Public Landing Page
  try {
    const res = await fetch(`${BASE_URL}/`);
    const text = await res.text();
    const hasNEC = text.includes("Nandha Engineering College (NEC)");
    const hasErode = text.includes("Erode, Tamil Nadu");
    report("Landing page branding & location (Nandha, Erode)", res.ok && hasNEC && hasErode, `Status: ${res.status}`);
  } catch (err) {
    report("Landing page", false, err.message);
  }

  // TEST 4: Login Page
  try {
    const res = await fetch(`${BASE_URL}/login`);
    const text = await res.text();
    const hasTitle = text.includes("Nandha Engineering College");
    report("Login page branding (Nandha Engineering College)", res.ok && hasTitle, `Status: ${res.status}`);
  } catch (err) {
    report("Login page", false, err.message);
  }

  // TEST 5: Faculty Review Queue
  try {
    const res = await fetch(`${BASE_URL}/faculty/reviews`, {
      headers: { Cookie: COOKIES.FACULTY },
    });
    const text = await res.text();
    const hasNandha = text.includes("Nandha Engineering College, Erode");
    const hasWorkbench = text.includes("Department Verification Workbench");
    report("Faculty Review Queue with Nandha Erode Evaluation Cell", res.ok && hasNandha && hasWorkbench, `Status: ${res.status}`);
  } catch (err) {
    report("Faculty Review Queue", false, err.message);
  }

  // TEST 6: Approval Page Detail / Review Workbench with Full View
  try {
    const certId = "77777777-7777-7777-7777-777777777701";
    const res = await fetch(`${BASE_URL}/faculty/reviews/${certId}`, {
      headers: { Cookie: COOKIES.FACULTY },
    });
    const text = await res.text();
    const hasNandhaProof = text.includes("Nandha Engineering College, Erode");
    const hasFullView = text.includes("Full View");
    const hasSha256 = text.includes("SHA-256");
    report(
      "Approval Page Certificate View with Full View & Nandha Evidence Proof",
      res.ok && hasNandhaProof && hasFullView && hasSha256,
      `Status: ${res.status}`
    );
  } catch (err) {
    report("Approval Page Certificate View", false, err.message);
  }

  // TEST 7: Certificate Image / Document Download Route (Approval Page Image)
  try {
    const filePath = "certificates/77777777-7777-7777-7777-777777777703/ieee_paper_cert.pdf";
    const res = await fetch(`${BASE_URL}/api/files/download?path=${encodeURIComponent(filePath)}`, {
      headers: { Cookie: COOKIES.FACULTY },
    });
    const contentType = res.headers.get("content-type") || "";
    const svgText = await res.text();
    const isSvg = contentType.includes("image/svg+xml");
    const hasNandhaCollege = svgText.includes("NANDHA ENGINEERING COLLEGE");
    const hasErode = svgText.includes("ERODE, TAMIL NADU");
    const hasAutonomous = svgText.includes("AUTONOMOUS");
    const hasSeal = svgText.includes("★ ERODE ★");

    report(
      "Approval Page Certificate Image SVG: Nandha Engineering College (Autonomous), Erode Seal",
      res.ok && isSvg && hasNandhaCollege && hasErode && hasAutonomous && hasSeal,
      `Status: ${res.status}, Type: ${contentType}`
    );
  } catch (err) {
    report("Certificate Image SVG Route", false, err.message);
  }

  // TEST 8: Admin Engineering Departments Page
  try {
    const res = await fetch(`${BASE_URL}/admin/departments`, {
      headers: { Cookie: COOKIES.ADMIN },
    });
    const text = await res.text();
    const hasNandha = text.includes("Nandha Engineering College (NEC)");
    const hasGovernance = text.includes("Academic Engineering Governance") || text.includes("Configure engineering branches");
    report(
      "Admin Engineering Departments Hub: Nandha Engineering College SSR Shell",
      res.ok && hasNandha && hasGovernance,
      `Status: ${res.status}`
    );
  } catch (err) {
    report("Admin Engineering Departments Hub", false, err.message);
  }

  // TEST 9: Admin Dashboard
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Cookie: COOKIES.ADMIN },
    });
    const text = await res.text();
    const hasNandha = text.includes("Nandha Engineering College (NEC)");
    const hasErode = text.includes("Erode, Tamil Nadu");
    report("Admin Executive Dashboard: Nandha Engineering College, Erode", res.ok && hasNandha && hasErode, `Status: ${res.status}`);
  } catch (err) {
    report("Admin Executive Dashboard", false, err.message);
  }

  // TEST 10: Student Dashboard
  try {
    const res = await fetch(`${BASE_URL}/student/dashboard`, {
      headers: { Cookie: COOKIES.STUDENT },
    });
    const text = await res.text();
    const hasStudentNandha = text.includes("Nandha Engineering College");
    report("Student Dashboard: Nandha Engineering College Register No", res.ok && hasStudentNandha, `Status: ${res.status}`);
  } catch (err) {
    report("Student Dashboard", false, err.message);
  }

  console.log("\n==========================================================");
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
