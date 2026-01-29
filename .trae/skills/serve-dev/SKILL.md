---
name: "serve-dev"
description: "Starts the local development server on port 8001. Invoke when user asks to start the service, test the app locally, or run the web server."
---

# Serve Dev

This skill starts a local HTTP server using Python on port 8001. 

## Usage

When the user wants to preview the application or start the local development environment, use this command:

```bash
python3 -m http.server 8001
```

## Why Port 8001?

Port 8001 is the designated port for local development in this project because it is pre-configured in the Supabase Authentication Redirect URLs. Using other ports (like 8000 or 3000) will cause Google OAuth login to fail.
