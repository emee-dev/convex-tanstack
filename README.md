Webhook.sh is an application that simplifies webhook integration offering the ability to receive webhooks, runs scripts, generate and copy integration scripts with AI assistance. It removes the anxiety that comes with integrating third party api services.

### Problem
When working with webhooks, it is very important to know the shape of the incoming request and also be able to write the integration code for it. I created this app to help me store the request, search for request and using AI to generate integration code snippets.

### Notable features
1. Ratelimiting requests
2. On Request scripting with Codemirror editor
3. Tanstack is very fun to work with.

### Tech stack
Tanstack start: Client/Server/Middleware functions API RoutesPage loaderError componentNot found componentclient renderingPre-rendering (/docs)SitemapFile uploadsCustom client entry 
Convex:
Queries/MutationsCron schedulesFile Storage/ServeConvex TriggersFull text searchAuth component with BetterAuthConvex + Tanstack queryRatelimit component
Sentry:Application observability + event contexts
Netlify:Application deployment 
Firecrawl:
On request utility functions eg $screenShotUrl(), $scrapeUrl()

Autumn:Not supported in my country

Coderabbit: Don't know how to use it.

Cloudflare: Application deploymentWorkers AI + AI SDK

Codemirror:Js Code Editor with incredible Typescript integration thanks to valtown extensions


### Why did I build this?
I built this primarily because I always have this axiety when working with webhooks. And this application is my way of reducing or eliminating that stress.


### Challenges
I had some issues understanding the Tanstack paradigm, and also deploying on netlify or cloudflare and getting exceptions after expceptions