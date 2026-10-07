create schema if not exists campus_private;
revoke all on schema campus_private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('student','faculty','recruiter')),
  requested_role text not null check (requested_role in ('student','faculty','recruiter')),
  created_at timestamptz not null default now()
);
create table public.students (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  program text not null default '' check (char_length(program) <= 120),
  year integer not null default 0 check (year between 0 and 6),
  semester integer not null default 0 check (semester between 0 and 12),
  target_role text not null default '' check (target_role in ('','Software Developer','Data Analyst','AI Engineer')),
  portfolio jsonb not null default '{"skills":[],"projects":[],"experience":[],"achievements":[],"consent":{"enabled":false,"skills":false,"projects":false,"education":false}}',
  goal jsonb,
  revision integer not null default 0,
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(portfolio)='object' and octet_length(portfolio::text)<=65536),
  check (jsonb_typeof(portfolio->'skills')='array' and jsonb_array_length(portfolio->'skills')<=30),
  check (jsonb_typeof(portfolio->'projects')='array' and jsonb_array_length(portfolio->'projects')<=20),
  check (jsonb_typeof(portfolio->'experience')='array' and jsonb_array_length(portfolio->'experience')<=20),
  check (jsonb_typeof(portfolio->'achievements')='array' and jsonb_array_length(portfolio->'achievements')<=20),
  check (jsonb_typeof(portfolio->'consent')='object'),
  check (goal is null or (jsonb_typeof(goal)='object' and char_length(goal->>'text') between 1 and 240 and goal->>'status' in ('planned','complete')))
);
create table public.student_measurements (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  domains jsonb not null default '[]' check (jsonb_typeof(domains)='array'),
  history jsonb not null default '[]' check (jsonb_typeof(history)='array')
);
create table public.demo_workspaces (
  slug text primary key check (slug='aaman'),
  payload jsonb not null check (jsonb_typeof(payload)='object')
);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.student_measurements enable row level security;
alter table public.demo_workspaces enable row level security;
revoke all on public.profiles,public.students,public.student_measurements,public.demo_workspaces from anon,authenticated;
grant select on public.profiles,public.students,public.student_measurements to authenticated;
grant update (display_name,program,year,semester,target_role,portfolio,goal,revision) on public.students to authenticated;
grant select on public.demo_workspaces to anon,authenticated;
create policy own_profile on public.profiles for select to authenticated using (id=(select auth.uid()));
create policy own_student on public.students for select to authenticated using (profile_id=(select auth.uid()));
create policy own_student_update on public.students for update to authenticated
using (profile_id=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='student'))
with check (profile_id=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='student'));
create policy own_measurements on public.student_measurements for select to authenticated using (profile_id=(select auth.uid()));
create policy synthetic_demo on public.demo_workspaces for select to anon,authenticated using (slug='aaman');

create function campus_private.provision_account() returns trigger
language plpgsql security definer set search_path='' as $$
declare requested text; assigned text;
begin
  requested:=coalesce(new.raw_user_meta_data->>'requested_role','student');
  if requested not in ('student','faculty','recruiter') then requested:='student'; end if;
  -- Self-registration grants only baseline student ownership. Staff/employer requests await approval.
  assigned:=case when requested='student' then 'student' else null end;
  insert into public.profiles(id,role,requested_role) values(new.id,assigned,requested);
  if assigned='student' then
    insert into public.students(profile_id,display_name) values(new.id,left(coalesce(new.raw_user_meta_data->>'display_name',''),80));
    insert into public.student_measurements(profile_id) values(new.id);
  end if;
  return new;
end; $$;
revoke all on function campus_private.provision_account() from public,anon,authenticated;
create trigger campus_account_created after insert on auth.users for each row execute function campus_private.provision_account();

create function campus_private.touch_student() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); new.revision=old.revision+1; return new; end; $$;
revoke all on function campus_private.touch_student() from public,anon,authenticated;
create trigger student_updated before update on public.students for each row execute function campus_private.touch_student();

-- Preserve existing identities; never grant a staff role from user-editable metadata.
insert into public.profiles(id,role,requested_role)
select id,case when raw_app_meta_data->>'role' in ('student','faculty','recruiter') then raw_app_meta_data->>'role' else null end,
case when raw_user_meta_data->>'requested_role' in ('student','faculty','recruiter') then raw_user_meta_data->>'requested_role' else 'student' end
from auth.users;
insert into public.students(profile_id,display_name) select p.id,left(coalesce(u.raw_user_meta_data->>'display_name',''),80) from public.profiles p join auth.users u on u.id=p.id where p.role='student';
insert into public.student_measurements(profile_id) select profile_id from public.students;

insert into public.demo_workspaces(slug,payload) values('aaman', $seed${"demoHistory": [{"period": "Semester 3", "academic": 7.6, "attendance": 85, "coding": 35}, {"period": "Semester 4", "academic": 7.9, "attendance": 87, "coding": 42}, {"period": "Semester 5", "academic": 8.2, "attendance": 89, "coding": 48}], "demoPortfolio": {"skills": [{"id": "javascript", "name": "JavaScript", "level": "Intermediate", "evidence": "Campus directory project"}, {"id": "sql", "name": "SQL", "level": "Intermediate", "evidence": "Campus directory project"}, {"id": "communication", "name": "Communication", "level": "Developing", "evidence": ""}], "projects": [{"id": "campus-directory", "title": "Campus directory", "description": "A searchable campus directory with JavaScript and SQL.", "skills": "JavaScript, SQL", "url": ""}], "experience": [], "achievements": [], "consent": {"enabled": false, "skills": true, "projects": true, "education": true}}, "demoRecommendation": {"id": "coding-practice", "title": "Build your coding assessment readiness", "reason": "Your sample coding assessment is 48 / 100. Practice is a relevant next action for your Software Developer goal.", "action": "Complete one algorithm practice set and record what you learned."}, "demoRoles": [{"title": "Software Developer", "description": "Build reliable applications and turn ideas into usable software.", "requirements": ["JavaScript", "SQL", "Data Structures", "Git", "Communication"]}, {"title": "Data Analyst", "description": "Explore data, communicate findings, and support decisions.", "requirements": ["SQL", "Python", "Statistics", "Data Visualization", "Communication"]}, {"title": "AI Engineer", "description": "Build and evaluate applications that use machine learning.", "requirements": ["Python", "Machine Learning", "SQL", "Git", "Communication"]}], "demoStudent": {"name": "Aaman Sharma", "id": "DEMO-001", "program": "B.Tech Artificial Intelligence", "year": 3, "semester": 5, "targetRole": "Software Developer", "advisor": "Dr. Reena Mehta", "domains": [{"id": "academic", "name": "Academic", "icon": "school", "value": 8.2, "max": 10, "unit": "CGPA", "source": "Student Information System", "detail": "Semester 5 academic record", "evidence": "CGPA: 8.2 / 10. No active backlogs in this sample.", "state": "Available"}, {"id": "attendance", "name": "Attendance", "icon": "calendar_month", "value": 89, "max": 100, "unit": "%", "source": "Attendance register", "detail": "Overall attendance", "evidence": "89 attended sessions out of 100 recorded sessions.", "state": "Available"}, {"id": "lms", "name": "LMS activity", "icon": "menu_book", "value": 4, "max": 6, "unit": "of 6 modules", "source": "Learning Management System", "detail": "Completed learning modules", "evidence": "4 completed modules; 2 remain in progress. This is completion, not a performance score.", "state": "Available"}, {"id": "engagement", "name": "Engagement", "icon": "groups", "value": 3, "max": null, "unit": "activities", "source": "Campus activity registry", "detail": "Recorded campus participation", "evidence": "Sample participation: coding club, AI seminar, and campus hackathon.", "state": "Available"}, {"id": "placement", "name": "Placement", "icon": "work", "value": 48, "max": 100, "unit": "/ 100", "source": "Placement assessment", "detail": "Coding assessment result", "evidence": "48 / 100 on the sample coding assessment. No interview or hiring outcome is inferred.", "state": "Available"}, {"id": "skills", "name": "Skills", "icon": "code", "value": 2, "max": null, "unit": "evidenced skills", "source": "Student portfolio", "detail": "Skills linked to projects", "evidence": "JavaScript and SQL are linked to a sample campus directory project. Evidence is sample, not verified.", "state": "Available"}, {"id": "feedback", "name": "Feedback", "icon": "forum", "value": null, "max": null, "unit": "", "source": "Student feedback", "detail": "No feedback supplied", "evidence": "This source has no data. Missing feedback is not interpreted as zero or negative feedback.", "state": "Missing"}]}, "campusHistory": [{"period": "Semester 3", "academic": 7.5, "attendance": 82, "coding": 49}, {"period": "Semester 4", "academic": 7.8, "attendance": 84, "coding": 57}, {"period": "Semester 5", "academic": 8.06, "attendance": 85.8, "coding": 61.8}], "cohort": [{"id": "DEMO-001", "name": "Aaman Sharma", "cohort": "AI \u00b7 Year 3", "cgpa": 8.2, "attendance": 89, "modules": 4, "coding": 48, "skills": ["JavaScript", "SQL"], "review": ["Coding practice evidence would help the career discussion."], "subjects": [82, 78, 86]}, {"id": "DEMO-002", "name": "Priya Nair", "cohort": "AI \u00b7 Year 3", "cgpa": 8.8, "attendance": 94, "modules": 6, "coding": 78, "skills": ["Python", "SQL", "Statistics"], "review": [], "subjects": [89, 87, 88]}, {"id": "DEMO-003", "name": "Vikram Patel", "cohort": "CSE \u00b7 Year 3", "cgpa": 7.1, "attendance": 72, "modules": 2, "coding": 52, "skills": ["JavaScript", "Git"], "review": ["Two of six LMS modules completed; discuss learning support.", "Attendance record needs a faculty conversation."], "subjects": [68, 74, 71]}, {"id": "DEMO-004", "name": "Ananya Sen", "cohort": "AI \u00b7 Year 3", "cgpa": 8.5, "attendance": 91, "modules": 5, "coding": 70, "skills": ["Python", "Machine Learning", "SQL"], "review": [], "subjects": [84, 89, 82]}, {"id": "DEMO-005", "name": "Sneha Kulkarni", "cohort": "CSE \u00b7 Year 3", "cgpa": 7.7, "attendance": 83, "modules": 3, "coding": 61, "skills": ["JavaScript", "SQL", "Communication"], "review": ["Three learning modules remain; review the study plan together."], "subjects": [76, 78, 77]}], "initialRecruiterRole": {"title": "Software Developer", "description": "Entry-level software development role.", "required": ["JavaScript", "SQL", "Git"], "preferred": ["Communication"], "education": "Relevant undergraduate program"}, "professionalCandidates": [{"id": "talent-priya", "name": "Priya Nair", "program": "B.Tech Artificial Intelligence", "targetRole": "Data Analyst", "skills": ["Python", "SQL", "Statistics"], "projects": [{"title": "Campus survey analysis", "description": "Sample analysis of a synthetic campus satisfaction dataset."}], "achievements": ["Sample data analytics course"], "summary": "Interested in data exploration and clear communication of findings."}, {"id": "talent-vikram", "name": "Vikram Patel", "program": "B.Tech Computer Science", "targetRole": "Software Developer", "skills": ["JavaScript", "Git"], "projects": [{"title": "Club event planner", "description": "Sample web application for organizing campus events."}], "achievements": [], "summary": "Builds practical web applications and collaborative projects."}, {"id": "talent-ananya", "name": "Ananya Sen", "program": "B.Tech Artificial Intelligence", "targetRole": "AI Engineer", "skills": ["Python", "Machine Learning", "SQL"], "projects": [{"title": "Image classifier study", "description": "Sample project comparing classifier evaluation methods."}], "achievements": ["Sample machine learning course"], "summary": "Interested in applied machine learning and reproducible evaluation."}], "subjects": ["Data Structures", "Database Systems", "AI & Machine Learning"]}$seed$::jsonb);
