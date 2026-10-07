// Synthetic filler accounts are loaded from the public database preview only.
export let cohort = [];
export let subjects = [];
export let campusHistory = [];
export let professionalCandidates = [];
export let initialRecruiterRole = {title:'',description:'',required:[],preferred:[],education:''};
export function setCampusDemo(payload) {
  ({cohort,subjects,campusHistory,professionalCandidates,initialRecruiterRole}=payload);
}
