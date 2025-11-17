# Webhook.sh

**Webhook.sh** is an application that simplifies webhook integration by offering the ability to receive webhooks, run scripts, and generate/copy integration snippets with AI assistance. It removes the anxiety that often comes with integrating third-party API services.

---

## 🚧 Problem

When working with webhooks, it is crucial to know the **shape of the incoming request** and be able to **quickly write integration code** for it.
I created this app to store requests, search through them, and generate integration snippets using AI.

---

## ✨ Notable Features

1. Rate-limiting incoming requests
2. On-request scripting using the Codemirror editor
3. Built with TanStack — which is extremely fun to work with

---

## 🧰 Tech Stack

### **TanStack Start**

- Client/Server/Middleware functions
- API Routes
- Page Loader
- Error Component
- Not-found Component
- Client Rendering
- Pre-rendering (e.g., `/docs`)
- Sitemap
- File Uploads
- Custom Client Entry

### **Convex**

- Queries / Mutations
- Cron Schedules
- File Storage / Serving
- Convex Triggers
- Full-text Search
- Auth Component (BetterAuth)
- Convex + TanStack Query
- Rate-limit Component

### **Sentry**

- Application observability
- Event context tracking

### **Netlify**

- Application deployment

### **Firecrawl**

- On-request utilities like:
  - `$screenShotUrl()`
  - `$scrapeUrl()`

### **Autumn**

- Not supported in my country

### **Coderabbit**

- Don't know how to use it.

### **Cloudflare**

- Workers AI + AI SDK

### **Codemirror**

- JS code editor
- Excellent TypeScript integration (thanks to Valtown extensions)

---

## 🧠 Why Did I Build This?

I built this primarily because I often feel anxious when working with webhooks.
This application is my way of reducing — or hopefully eliminating — that stress.

---

## 🧩 Challenges

I encountered difficulties understanding the TanStack paradigm, and also ran into several deployment challenges on Netlify and Cloudflare, including repeated exceptions.
