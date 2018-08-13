Shadow Cartel Wormhole Mapper
=============================

Introduction
-----

This is the code used by the shadow cartel wormhole mapper. It doesn't actually
work right now (following CCP's retiring of certain legacy APIs) but maybe that
can be fixed.

The system has four main components:

 - mapper-website
 - login-server
 - maintenance-server
 - firebase

It is entirely written in Javascript, using the following primary technologies:

 - Angular Version 1
 - Gulp
 - Node Js / NPM
 - sigma-js (graphing library)

I wrote this code 4 years ago over a period of around 3 months.. As is the
nature of the javascript ecosystem, things have moved on a lot since then -
certainly Gulp and Angular 1 are uncommon choices now.

In terms of code quality, I think the project is mediocre. It was my first
substantial javascript project, and as a personal project I took more shortcuts
and made more hacks than I would when developing professionally. In particular,
there is very little automated testing, and the testing there is is very sparse.
As far as I can recall, only the `pathfinder` code (the code that implements the
path finding algorithm) and the eve API wrapper have any tests!

## Subsystems

### mapper-website
This is the main website that users use to view the site. I initially designed
it to be hosted by github pages, so it is entirely static HTML and javascript.

You can read up on the Angular 1 model to get an idea for how it works - I think
my implementation stays fairly close to the standard pattern. See
`app/js/controllers` for controller code - there is one for each page the user can
visit. These are tied to html templates in `app/views`. `app/js/services` contains
some non-UI code that I didn't feel was necessary to promote to the common library.
`app/js/directives` contains some angular directives (something like a widget/UI
component) tha are shared by several pages.

`app/data` contains static data about systems in EVE as well as wormhole types.
I can't actually remember how I generated these files now (though the `scripts`
folder in the root of the repository seems related?) So don't lose these!

### login-server
This handles authentication (using CCP's SSO system) and authorization.
Authorization has three providers:

 - the database
 - some hard-coded users
 - Itsme's login server (I'm not sure if this is still running - it can be        disabled via config)

I designed login-server to be hosted as an app on Azure.

### maintenance-server
Any housekeeping jobs that need to run ocassionally live here. It was also
designed to run on Azure.

Currently it hosts 3 kinds of jobs:

#### eve-scout-import
scrapes eve scout to import Thera wormholes (I'm not sure if eve scout even
exists anymore?)

#### leaderboard-recorder
This aggregates data on scouted wormholes to generate the leaderboard

#### old-data-cleaner
This does a bunch of different database maintenance bits and pieces - mostly
to clean up or aggregate old data.

### Firebase
Firebase provides the database for the system. This is a database-as-a-service
key-value store. Note the file `firebase-rules.json`, which holds security
rules for firebase.

### Libraries
There is a substantial amount of code checked in to the repository under
`node_modules` - in the `local` folder (stuff I wrote) and `moment` (a third
party timing library). This is a hack - when I wrote this project, I didn't
really understand the node js package resolution mechanism, and so this was the
best solution to share code between projects I could come up with!

List of libraries:

#### eve-api
This implemented queries to search for info about EVE characters / corporations 
/ alliances, and to retrieve info about those entities. I think this is the main
area that was broken by CCP's retiring of old APIs.

#### pathfinder
This implements path finding for the website. I tried various different algorithms,
but ultimately settled on a weird, hacked-together kind of solution that seems
to work in most cases! Some of the code here (for example, `k-shortest-paths.js`)
is from some of these exploratory implementations, and is currently unused.

#### repositories
There are many classes in here to handle communicating with the Firebase backend.
Broadly speaking, I think there is one repository per database "table" (though
firebase doesn't really have the concept of tables).

#### Others
There are a few other bits and pieces hanging around in here too - small things that
I cant remember where they are used!

## System Concepts

### Building
You can build each of `mapper-website`/`login-server`/`maintenance-server` by
installing node-js, then running something like:

````
cd PROJECT_DIR
npm install
gulp build
````

Check the individual gulp files for full details.

### Config
Each subsystem has a `config.js` file that holds various bits and pieces,
such as the location of the database and the URLs of other components. I've
blanked some of the important bits out for the purpose of hosting this
publicly - you can reach out to me for the original config files if you're
interested.

### Database
The database is provided by Firebase. I *think* that the system should work
even when targetting a blank Firebase instance - it should create any
missing tables it needs when it realizes it is missing them. Perhaps it may
require a little tweaking here and there. You should definitely apply the
security rules to the firebase instance that are in `firebase-rules.json`.

Reach out to me for an extract of the current database - unfortunately the
firebase free plan does not allow multiple users, and it is tied to my
gmail account, so I can't share the details.

### Deploying
To deploy a copy of this system elsewhere, I believe you'd need to:

 - Create a new firebase instance
 - Find somewhere to host the login server and maintenance server
 - Find somewhere to host the website
 - Update the configuration files of all 3 applications with the new database, as well
   as the locations of each other (when appropriate)
 - build each application (having updated their config files)
 - host everything!

### Final Thoughts
I enjoyed working on this project when I was initially putting it together, but
as is the way with side projects, I've since moved on. I'm not sure how easy it
would be to pick it up, tweak it a little bit, and deploy it elsewhere - but
good luck, and well done if you manage it!

One thing that might be handy is the compiled, deployable representation of all
the projects - I have these zipped up, but can't provide them on github as they
contain secret keys and similar credentials. I can provide these to interested
parties.

You can reach out to me through github or other means if you need any assistance.

 ~ Oliver, August 2018.