import seed from '../supabase/seeds/demo-workspace.json' with {type:'json'};
import {setStudentDemo} from '../src/data/demo-student.js';
import {setCampusDemo} from '../src/data/demo-campus.js';
setStudentDemo(seed);setCampusDemo(seed);
