# GitHub AI Assistant

An AI-powered tool that lets you chat with any GitHub repository. Paste a repo link, and the assistant scrapes, indexes, and embeds the entire codebase — then answers your questions about it, returns the most relevant files, and even summarizes your team meetings.

## Features

### 🔍 Repo Q&A
- Paste any public GitHub repo URL
- The repo is loaded via LangChain, summarized, and embedded using pgvector
- Ask anything about the codebase — architecture, logic, specific files
- Every response includes the **5 most relevant files** to your query

### 👥 Team Collaboration
- Invite multiple collaborators to the same repo workspace
- Full invite system — share access with your team

### 🎙️ Meeting Intelligence
- Upload meeting recordings directly to the platform
- Powered by **AssemblyAI** — get AI-generated summaries with chapters
- Keep your repo context and meeting notes in one place

### 💳 Token-Based Usage
- AI usage is powered by a token system
- Buy tokens directly in the app
- **Full Stripe integration** — test payments implemented end to end

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (T3 Stack) |
| Language | TypeScript |
| Auth | NextAuth.js |
| ORM | Prisma |
| Database | PostgreSQL (Neon) |
| Vector Store | pgvector |
| AI / RAG | LangChain |
| Meeting AI | AssemblyAI |
| Payments | Stripe |
| Styling | Tailwind CSS + ShadCN UI |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database with pgvector extension enabled
- API keys for your LLM provider, AssemblyAI, and Stripe

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/dhruvv7115/github-ai-assistant
   cd github-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in all required values in `.env`.

4. **Set up the database**
   ```bash
   # Enable pgvector in your Postgres instance first
   # Then run:
   npx prisma db push
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for the full list of required environment variables including database, LLM, AssemblyAI, and Stripe credentials.

## How It Works

1. User submits a GitHub repo URL
2. LangChain crawls and loads all files from the repo
3. Files are chunked, embedded, and stored in pgvector
4. A summary of the repo is generated and saved
5. On each query, relevant chunks are retrieved via similarity search
6. The LLM answers using the retrieved context and returns the top 5 related files

## Deployment

- **Frontend + API**: [Vercel](https://vercel.com)
- **Database + pgvector**: [Neon](https://neon.tech)

See the [T3 deployment guides](https://create.t3.gg/en/deployment/vercel) for detailed instructions.
