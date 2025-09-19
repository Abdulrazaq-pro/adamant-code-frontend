# Chatbot API

## Overview
This is a full-stack chatbot application built with Next.js and TypeScript. It provides a backend API to manage chat conversations and stream responses , its just a demo response.

## Features
- **Next.js**: Provides the full-stack framework, including API routes for backend logic.
- **Zustand**: Handles client-side state management for conversations and messages.
- **API Proxy**: Forwards requests for data persistence to a separate backend service.
- Uses demo response to simulate AI response

## Getting Started
### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo.git
    cd chatbot-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file by copying the example and fill in the required values.
    ```bash
    cp .env.example .env.local
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Environment Variables
All required environment variables must be set in a `.env.local` file.

-   `BACKEND_URL`: The URL of the backend service used for persisting conversations and messages.
    -   Example: `BACKEND_URL="http://localhost:8080"`

## API Documentation
### Base URL
`/api`

### Endpoints
#### POST /api/chat
Streams a chat completion response from the selected AI model.

**Request**:
```json
{
  "messages": [
    {
      "id": "cmflsz587000otxz084aeevev",
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "selectedModel": "meta-llama/Llama-3.3-70B-Instruct-Turbo"
}
```

**Response**:
A streaming UI message response handled by the Vercel AI SDK.

**Errors**:
-   `429 Too Many Requests`: "Rate limit exceeded. Please try again later."
-   `500 Internal Server Error`: "An error occurred."

---

#### GET /api/conversations
Retrieves all existing chat conversations.

**Request**:
No payload required.

**Response**:
```json
{
  "success": true,
  "message": "Conversations fetched successfully",
  "data": [
    {
      "id": "cmflsxarb000atxz0s5lmoe8y",
      "title": "New Conversation",
      "createdAt": "2025-09-16T00:15:17.688Z",
      "updatedAt": "2025-09-16T00:17:17.915Z",
      "isDeleted": false,
      "messages": [
        {
          "id": "cmflsz587000otxz084aeevev",
          "content": "omooooooooooooo",
          "isUser": true,
          "conversationId": "cmflsxarb000atxz0s5lmoe8y",
          "createdAt": "2025-09-16T00:16:43.831Z"
        }
      ]
    }
  ]
}
```

**Errors**:
-   `500 Internal Server Error`: "Failed to fetch conversations"

---

#### POST /api/conversations
Creates a new conversation.

**Request**:
```json
{
  "title": "My first test conversation"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Conversation created successfully",
    "data": {
        "id": "cmflqvshj001gtxjwfkilbqb7",
        "title": "My first test conversation",
        "createdAt": "2025-09-15T23:18:05.044Z",
        "updatedAt": "2025-09-15T23:18:05.044Z",
        "isDeleted": false
    }
}
```

**Errors**:
-   `500 Internal Server Error`: "Failed to create conversation"

---

#### DELETE /api/conversations
Deletes a specific conversation by its ID. The ID should be passed as a URL query parameter.

**Request**:
`DELETE /api/conversations?id=cmflqvshj001gtxjwfkilbqb7`

**Response**:
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

**Errors**:
-   `400 Bad Request`: "Conversation ID is required"
-   `500 Internal Server Error`: "Failed to delete conversation"

---

#### GET /api/messages
Retrieves all messages for a specific conversation. The conversation ID must be passed as a URL query parameter.

**Request**:
`GET /api/messages?conversationId=cmflsxarb000atxz0s5lmoe8y`

**Response**:
```json
{
    "success": true,
    "message": "Messages fetched successfully",
    "data": [
        {
            "id": "cmflsz587000otxz084aeevev",
            "content": "omooooooooooooo",
            "isUser": true,
            "conversationId": "cmflsxarb000atxz0s5lmoe8y",
            "createdAt": "2025-09-16T00:16:43.831Z"
        },
        {
            "id": "cmflsz6fl000qtxz0lohxi169",
            "content": "This is an AI generated response",
            "isUser": false,
            "conversationId": "cmflsxarb000atxz0s5lmoe8y",
            "createdAt": "2025-09-16T00:16:45.394Z"
        }
    ]
}
```

**Errors**:
-   `400 Bad Request`: "conversationId parameter is required"
-   `500 Internal Server Error`: "Failed to fetch messages"

---

#### POST /api/messages
Adds a new message to a conversation and receives an AI-generated response.

**Request**:
```json
{
  "conversationId": "cmflsxarb000atxz0s5lmoe8y",
  "content": "What is Next.js?",
  "sender": "user",
  "createdAt": "2025-09-16T00:16:43.831Z"
}
```

**Response**:
The response contains the AI's generated message object.
```json
{
    "success": true,
    "message": "Message created successfully",
    "data": {
        "id": "cmflt1ghc0012txz0dv6hr51f",
        "content": "Next.js is a React framework for building full-stack web applications.",
        "isUser": false,
        "conversationId": "cmflsxarb000atxz0s5lmoe8y",
        "createdAt": "2025-09-16T00:18:31.728Z"
    }
}
```

**Errors**:
-   `500 Internal Server Error`: "Internal server error"

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)