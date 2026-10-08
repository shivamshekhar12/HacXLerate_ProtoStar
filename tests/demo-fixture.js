import seed from '../supabase/seeds/demo-workspace.json' with {type:'json'};
import {setStudentDemo} from '../src/data/demo-student.js';
import {setCampusDemo} from '../src/data/demo-campus.js';
setStudentDemo(seed);setCampusDemo(seed);

import catalogSeed from '../supabase/seeds/campus-catalog.json' with {type:'json'};
import {catalog} from '../src/services/catalog-service.js';
import {setRoleTemplates} from '../src/data/demo-student.js';
Object.assign(catalog,catalogSeed);setRoleTemplates(catalog.roles);
