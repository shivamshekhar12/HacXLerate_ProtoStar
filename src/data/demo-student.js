// Database-backed synthetic preview data; no student records are bundled with the app.
export let demoStudent = null;
export let demoPortfolio = null;
export let demoHistory = [];
export let demoRecommendation = {};
export let demoRoles = [];
export function setStudentDemo(payload) {
  ({demoStudent,demoPortfolio,demoHistory,demoRecommendation,demoRoles}=payload);
}

export function setRoleTemplates(roles){demoRoles=roles;}
