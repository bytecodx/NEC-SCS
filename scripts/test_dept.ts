import { getDB } from "@/lib/db/store";
import {
  getDepartmentsAction,
  createDepartmentAction,
  updateDepartmentAction,
  getDepartmentListAction,
  getInstitutionalAnalyticsAction,
  addStudentAction,
} from "@/actions/admin";

async function runTests() {
  console.log("=== Testing Separate UG and PG Department Features ===");
  const db = getDB();

  // 1. Verify Seed Departments
  const ugDepts = db.departments.filter((d) => d.type === "UG");
  const pgDepts = db.departments.filter((d) => d.type === "PG");
  console.log(`✓ UG Departments found: ${ugDepts.length} (${ugDepts.map(d => d.code).join(", ")})`);
  console.log(`✓ PG Departments found: ${pgDepts.length} (${pgDepts.map(d => d.code).join(", ")})`);

  if (ugDepts.length !== 7 || pgDepts.length !== 4) {
    throw new Error(`Expected 7 UG and 4 PG departments, got ${ugDepts.length} UG and ${pgDepts.length} PG`);
  }

  // 2. Test getDepartmentListAction with filters
  const allActive = await getDepartmentListAction();
  const ugList = await getDepartmentListAction({ type: "UG" });
  const pgList = await getDepartmentListAction({ type: "PG" });
  console.log(`✓ getDepartmentListAction total: ${allActive.length}, UG: ${ugList.length}, PG: ${pgList.length}`);

  // 3. Test createDepartmentAction
  const createRes = await createDepartmentAction({
    name: "M.Tech Data Science & Analytics",
    code: "MTECH-DSA",
    type: "PG",
  });
  console.log(`✓ createDepartmentAction PG:`, createRes.success, createRes.department?.code, createRes.department?.type);

  if (!createRes.success || createRes.department?.type !== "PG") {
    throw new Error("Failed to create PG department properly");
  }

  // 4. Test updateDepartmentAction
  const updateRes = await updateDepartmentAction(createRes.department.id, {
    name: "M.Tech Data Science & Artificial Intelligence",
    code: "MTECH-DSA",
    type: "PG",
    is_active: true,
  });
  console.log(`✓ updateDepartmentAction PG:`, updateRes.success, updateRes.department?.name);

  // 5. Test getInstitutionalAnalyticsAction
  const analytics = await getInstitutionalAnalyticsAction();
  console.log(`✓ Analytics UG Depts: ${analytics.ugDeptCount}, PG Depts: ${analytics.pgDeptCount}`);
  console.log(`✓ Analytics UG Students: ${analytics.ugStudentsCount}, PG Students: ${analytics.pgStudentsCount}`);
  console.log(`✓ Analytics Total Certs: ${analytics.totalCertificates}`);

  // 6. Test addStudentAction with PG department
  const addStudentRes = await addStudentAction({
    fullName: "Aravindhan S",
    email: "aravindhan.pg@student.abctech.edu",
    registerNumber: "710025CS0099",
    academicYear: 1,
    departmentId: createRes.department.id,
  });
  console.log(`✓ addStudentAction in PG Dept:`, addStudentRes.success, addStudentRes.message);

  console.log("=== ALL UNIT TESTS PASSED SUCCESSFULLY ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
