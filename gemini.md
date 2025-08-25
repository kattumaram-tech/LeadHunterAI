# Gemini Backend Integration Plan

This document outlines the plan to integrate a Python backend with the LeadHunterAI frontend.

## 1. Backend (Python & FastAPI)

A new `backend` directory will be created.

### Dependencies

The backend will require the following Python packages, which will be listed in `backend/requirements.txt`:
- `fastapi`: For creating the web server.
- `uvicorn`: To run the FastAPI server.
- `python-dotenv`: To manage environment variables (for the API key).
- `google-generativeai`: The official Google library for the Gemini API.
- `fastapi-cors`: To handle Cross-Origin Resource Sharing (CORS).

### Environment Variables

The backend will require a `.env` file with the following variable:
```
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### API Endpoint

- **Endpoint:** `/api/search`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "niche": "string",
    "region": "string",
    "quantity": "integer",
    "criteria": "string"
  }
  ```
- **Success Response (200):**
  ```json
  [
    {
      "id": "string",
      "name": "string",
      "instagram": "string (optional)",
      "website": "string (optional)",
      "whatsapp": "string (optional)",
      "contact": "string",
      "score": "integer"
    }
  ]
  ```
- **Error Response (500):**
  ```json
  {
    "detail": "Error message"
  }
  ```

### Prompt Engineering

The backend will construct a detailed prompt for the Gemini API, instructing it to act as a lead generation specialist. The prompt will ask for a JSON array of leads based on the provided niche, region, and criteria.

## 2. Frontend (React & Vite)

### API Integration

- The `handleFormSubmit` function in `src/pages/Index.tsx` will be updated to send a `POST` request to the `/api/search` endpoint using `fetch`.
- The mock `setTimeout` will be removed.
- The component state (`leads`, `isLoading`, `showResults`) will be updated based on the response from the backend.

### Development Server Proxy

- The `vite.config.ts` file will be modified to include a server proxy. This will redirect any requests made to `/api` from the frontend development server (e.g., `localhost:8080`) to the backend server (`localhost:8000`). This avoids CORS problems during development.

```typescript
// vite.config.ts addition
server: {
  host: "::",
  port: 8080,
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    },
  },
},
```

## 3. Execution Steps

1.  Create the `backend` directory and all associated files (`main.py`, `requirements.txt`, `.env.example`).
2.  Implement the FastAPI server and the `/api/search` endpoint logic.
3.  Modify `vite.config.ts` to add the proxy.
4.  Update `src/pages/Index.tsx` to call the new backend API.
