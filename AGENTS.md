# agents guide for nin

this file is the single source of truth for any person ai or agent working on this project read it fully before touching any code it covers design philosophy architecture code style and the why behind every non-obvious decision

if you are an ai agent read the whole file do not skim

## what this project is

nin is [one paragraph describing what the site does who it is for and what problem it solves fill this in before anything else since every other section assumes this context]

## design philosophy

[describe the actual visual and interaction philosophy here concretely for example if the site should feel minimal say what minimal means in concrete terms specific fonts specific spacing rules specific things it deliberately does not do and why a vague word like clean or modern is not a design philosophy a stated tradeoff is]

### [principle one]

[one paragraph stating the choice and the concrete reason for it not just the choice itself]

### [principle two]

[same pattern]

## supported environments

state the actual target here concretely

- which browsers and minimum versions are supported and why [not yet decided state the actual floor here once chosen]
- this is a next.js app using both server and client components not a purely static site and not a purely client-rendered one next.js is used as a fullstack framework there is no separate backend service api routes and server logic live inside the next.js project itself
- the minimum node version if there is a build step and why that floor was chosen [not yet decided state the actual floor here once chosen]

## architecture

### file layout

```
[replace this with the actual real file tree once the project has one a
placeholder tree teaches nothing keep this updated as the project grows]
```

### where logic lives

there is no separate backend service next.js is used as a fullstack framework so data fetching server logic and rendering all live inside the same next.js project

the real boundary is between server components and client components not between frontend and backend code that no longer exists as a separate concept here a component is a server component unless it genuinely needs interactivity state or a browser-only api in which case it is explicitly marked as a client component do not mark something a client component out of habit or because it feels safer every unnecessary client component ships more javascript to the browser than it needs to

data fetching happens directly inside server components or server actions not through a client-side fetch to an internal api route unless the data is genuinely needed on the client after initial load

### state and data flow

[if the project has meaningful client state or a data-fetching layer
describe how data moves through it and any hard rules about where state
is allowed to live skip this section entirely if the project is simple
enough not to need it a missing section is better than an invented one]

## code style

### comments

- all comments are lowercase no exceptions unless a capital letter is required to preserve meaning for example `curl -fsSL` must keep the capital `S` and `L` because they are case-sensitive flags
- no punctuation in comments no periods no commas no exclamation marks no question marks unless punctuation changes meaning
- explain why not what the code already shows what it does
- no block comment boxes no jsdoc banners use plain single-line comments only
- no references to other projects by name in comments
- no llm-smell phrases like "here we" "let's" "we need to" "note that" "important:" "todo" "fixme"
- for obscure or uncommon code provide both what and why for common code provide only why
- provide verified working links whenever possible prefer official documentation over blog posts

### code structure

- split logic into small files each with a single responsibility
- keep entry points as small as possible they should only wire things together
- one concept per file one file per concept
- prefer pure functions with no side effects in utility files
- this project uses typescript throughout there is a build step via next.js do not add plain javascript files new code is typescript by default
- styling is tailwind css utility classes in the markup not separate css files and not css-in-js do not introduce a second styling approach alongside tailwind

### anti ai-code smells

- do not wrap standard api calls in try/catch blocks unless the call is genuinely fallible
- do not use try/catch to silence errors that should never happen return null or throw explicitly instead
- do not use optional chaining `?.` or nullish coalescing `??` for values that are guaranteed to exist
- do not add defensive null checks that mask bugs instead of handling them
- do not add just-in-case code for situations that cannot occur given the actual data flow
- do not add comments that describe what a line does only describe why

### review discipline

- before producing final output read every single line you wrote
- look for potential issues on every line not just the line you are currently editing
- when fixing a bug check whether the same bug pattern exists elsewhere in the codebase
- do not assume a fix works verify it against the actual code

## accessibility

[state the actual accessibility bar for this project concretely for
example does every interactive element need a visible focus state is
there a target color contrast ratio does every image need meaningful alt
text a vague we care about accessibility is not a rule a specific
checkable standard is]

## contacts

- repository https://github.com/itsnin/website
- security issues ninx.sh@gmail.com

## license

[license identifier] see the LICENSE file
