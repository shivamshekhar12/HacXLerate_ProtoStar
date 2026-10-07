import { icon } from '../../components/ui.js';
const options=[['student','school','Student'],['faculty','supervisor_account','Faculty'],['recruiter','work','Recruiter']];
export function renderLogin({configured=true,signup=false,management=false}={}) {
  return `<main id="main" tabindex="-1" class="login-page">
    <section class="login-story" aria-labelledby="story-heading">
      <a class="login-brand" href="#/login"><span class="login-logo">${icon('school')}</span><span>Smart Campus<small>SUCCESS PORTAL</small></span></a>
      <div class="story-content"><span class="story-eyebrow">A CONNECTED CAMPUS. A SHARED PURPOSE.</span><h1 id="story-heading">Your campus.<br> A clearer path<br> forward.</h1><p class="story-intro">Bring academic progress, career evidence, and human support into one connected workspace.</p>
      <div class="story-features"><div>${icon('trending_up')}<div><h2>Students grow with direction</h2><p>Understand your progress, build evidence, and plan your next step.</p></div></div><div>${icon('groups')}<div><h2>Faculty turn insight into support</h2><p>Review cohort progress and keep meaningful follow-ups in view.</p></div></div><div>${icon('person_search')}<div><h2>Recruiters discover relevant talent</h2><p>Explore professional skills and projects through consent-aware profiles.</p></div></div></div></div>
      <div class="story-footer"><span>One platform. Three perspectives.</span><span>Smart Campus AI</span></div>
    </section>
    <section class="login-side" aria-labelledby="login-heading"><div class="login-form-wrap">
      <span class="login-kicker">WELCOME TO SMART CAMPUS</span><h2 id="login-heading">${management?'Account management':signup?'Create your account':'Welcome back'}</h2><p class="login-intro">${management?'Authorized access to the account directory.':signup?'Start fresh. Your records and portfolio belong to you.':'Choose your workspace and sign in to continue.'}</p>
      <form id="login-form" data-mode="${management?'management':signup?'signup':'login'}" novalidate>
        ${signup?'<div class="login-field"><label for="signup-name">Full name</label><div class="login-input"><input id="signup-name" name="displayName" autocomplete="name" maxlength="80" required placeholder="Your full name"/></div><p class="login-field-error" id="name-error"></p></div>':''}
        ${management?'<input type="hidden" name="role" value="management"/>':''}<fieldset class="login-role-fieldset" ${management?'hidden':''}><legend>${signup?'Create an account as':"I'm signing in as"}</legend><div class="login-role-options">${options.map(([role,symbol,label],i)=>`<label class="login-role"><input type="radio" name="${management?'unusedRole':'role'}" value="${role}" ${i===0?'checked':''}/><span>${icon(symbol)}<strong>${label}</strong></span></label>`).join('')}</div></fieldset>
        <div class="login-field"><label for="login-email">Email address</label><div class="login-input">${icon('mail')}<input type="email" id="login-email" name="email" placeholder="you@example.edu" autocomplete="username" autocapitalize="none" spellcheck="false" required aria-describedby="email-error"/></div><p class="login-field-error" id="email-error"></p></div>
        <div class="login-field"><label for="login-password">Password</label><div class="login-input">${icon('lock')}<input type="password" id="login-password" name="password" placeholder="Enter your password" autocomplete="${signup?'new-password':'current-password'}" ${signup?'minlength="8"':''} required aria-describedby="password-error"/><button class="password-toggle" type="button" aria-label="Show password" aria-pressed="false">${icon('visibility')}</button></div><p class="login-field-error" id="password-error"></p></div>
        <div id="login-error" class="login-message" role="alert" hidden></div><div id="login-status" class="sr-only" role="status"></div>
        <button class="button login-submit" type="submit" ${configured?'':'disabled'}><span id="login-button-label">${management?'Sign in to manage accounts':signup?'Create Student account':'Sign in as Student'}</span>${icon('arrow_forward')}</button>
      </form>
      ${configured?'':'<p class="login-message">Sign-in is not configured on this copy. Use the demo preview below.</p>'}
      <p class="account-help">${signup?'Already have an account? <a href="#/login">Sign in</a>':'New to Smart Campus? <a href="#/signup">Create an account</a>'}</p>${signup?'<p class="demo-caption">Use at least 8 characters. Faculty and recruiter access requests require approval.</p>':''}
      <div class="login-divider"><span>EXPLORE THE PROTOTYPE</span></div><button class="button login-demo" id="demo-preview" type="button">${icon('science')}Explore demo preview</button><p class="demo-caption">No account needed. Synthetic data only.</p>
      <p class="login-privacy">${icon('verified_user')}Your account determines access to your workspace. <a href="#/management/login">Account management</a></p>
    </div><span class="login-copyright">Smart Campus AI · Student success, thoughtfully connected.</span></section>
  </main>`;
}
