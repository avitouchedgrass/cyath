# Cyath

> **Behavioral Momentum Engineered.**

Cyath is a full-stack, adaptive behavioral health platform that replaces rigid habit-streak mechanics with real-time feedback loops. By correlating daily whole-food nutrition, sleep quality, and physical recovery metrics with subjective energy and focus, Cyath automatically scales daily routines to prevent burnout and maintain long-term momentum.

---

## Key Features

* **Adaptive Routine Scaling:** Dynamically adjusts daily habit workloads based on logged sleep, energy, and physical recovery markers—eliminating the punitive "streak reset" fatigue.
* **Whole-Food Fuel & Macro Tracking:** Built-in logging for whole-food nutrition, tracking key variables like protein intake and calorie balance alongside performance outcomes.
* **Correlation Engine:** Uses structured data logs to analyze how physical inputs (e.g., 7+ hours of sleep, 100g+ protein) directly correlate with high-focus output days.
* **Contextual AI Health Agent:** A local, RAG-enabled LLM pipeline that queries user history to deliver privacy-focused, individualized recovery and routine recommendations.
* **Pixel-Art Aesthetic & Editorial UI:** High-contrast, performance-focused interface styled in an editorial cream-and-forest-green design language with custom 16-bit visual assets.

---

## Tech Stack

* **Frontend:** Next.js (React), TypeScript, Tailwind CSS
* **Backend:** Node.js (Express), Python (FastAPI for asynchronous analytical tasks)
* **Database & Caching:** PostgreSQL (relational logs & user data), Redis (active session & routine state)
* **AI / ML Layer:** Local LLM Agent architecture integrated via a Retrieval-Augmented Generation (RAG) pipeline with vector embeddings

---

## System Architecture Overview


```

[ Frontend (Next.js / TS) ]
│
▼  (REST / GraphQL API)
[ Node.js / Express API ] ───► [ PostgreSQL / Redis ]
│
▼  (Async Analytics Payload)
[ FastAPI ML Service ] ──────► [ Vector DB / Local RAG Engine ]

```

---

## Getting Started Locally

### Prerequisites
* Node.js (v18+)
* Python (v3.10+)
* PostgreSQL & Redis instances (local or managed)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/cyath.git](https://github.com/your-username/cyath.git)
   cd cyath

```

2. **Install frontend & API dependencies:**
```bash
npm install

```


3. **Set up environment variables:**
Create a `.env.local` file in the root directory and add your configurations:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cyath
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

```


4. **Run database migrations:**
```bash
npx prisma db push

```


5. **Start the development server:**
```bash
npm run dev

```


Open `http://localhost:3000` in your browser.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

```

***

<ElicitationsGroup message="What would you like to do next?">
<Elicitation label="Add a section detailing the RAG pipeline setup and configuration" query="Add a section detailing the RAG pipeline setup and configuration to the README" query_intent="CLICKABLE_SUGGESTION" />
<Elicitation label="Draft a CONTRIBUTING.md guide for open-source contributors" query="Draft a CONTRIBUTING.md guide for the Cyath repository" query_intent="CLICKABLE_SUGGESTION" />
<Elicitation label="Create a license file and badges for the top of the README" query="Create a standard MIT License block and Markdown badges for Cyath" query_intent="CLICKABLE_SUGGESTION" />
</ElicitationsGroup>

```
