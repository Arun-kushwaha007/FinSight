# apps/ai/main.py
import os
import json
import requests
from typing import List, Optional, Tuple, Any
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
SERVICE_API_KEY = os.getenv("SERVICE_API_KEY")  # shared secret for backend->AI
AI_PORT = int(os.getenv("AI_SERVICE_PORT", "8001"))

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not set in env")

app = FastAPI(title="FinSight AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models
class Transaction(BaseModel):
    id: Optional[str]
    date: str
    amount: float
    currency: Optional[str] = "INR"
    description: Optional[str] = ""
    category: Optional[str] = None
    type: Optional[str] = None

class InsightRequest(BaseModel):
    userId: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    transactions: Optional[List[Transaction]] = None

# --- helpers
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODELS = [
    "meta-llama/llama-4-maverick:free",
    "meta-llama/llama-4-scout:free"
]

def call_openrouter_with_fallback(prompt: str, max_tokens: int = 600, timeout: int = 25) -> Tuple[str, str]:
    """
    Attempts each model in MODELS order. Returns (content, model_used).
    Raises Exception if all fail.
    """
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "X-Title": "FinSight",
    }

    last_err = None
    for model in MODELS:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "You are FinSight, an intelligent personal finance assistant. Return JSON when asked."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": max_tokens
        }
        try:
            r = requests.post(OPENROUTER_URL, json=payload, headers=headers, timeout=timeout)
            r.raise_for_status()
            data = r.json()
            # openrouter response shape: choices[0].message.content
            content = data.get("choices", [{}])[0].get("message", {}).get("content")
            if not content:
                # sometimes content is elsewhere – fallback to raw response if needed
                content = json.dumps(data)
            return content, model
        except Exception as e:
            last_err = e
            # if rate limit or server error, try next model
            continue

    raise Exception(f"All models failed. Last error: {last_err}")

def build_prompt(transactions: List[dict], user_context: Optional[dict] = None) -> str:
    """
    Create a tight, deterministic prompt for summarization + recommendations + anomalies.
    Keep it explicit: request JSON with keys: summary, recommendations, anomalies.
    """
    # short sample of transactions (limit to N)
    N = 120  # large context available for Maverick; still limit for safety
    sample = transactions[:N]
    tx_lines = []
    for t in sample:
        date = t.get("date")
        desc = (t.get("description") or "").replace("\n", " ")
        amt = t.get("amount")
        cat = t.get("category") or ""
        tx_lines.append(f"{date} | {desc} | {amt} | {cat}")
    tx_text = "\n".join(tx_lines)

    prompt = f"""
You are FinSight, an automated financial insights engine. You will receive a list of bank transactions (date | description | amount | category).
Task:
1) Produce a short JSON object ONLY with keys:
   - summary: a 2-3 sentence plain-English summary of the user's financial status for the provided transactions;
   - recommendations: an array of up to 5 short bullet items, actionable and prioritized;
   - anomalies: an array of anomaly objects {{"id": <id or null>, "explanation": <short text>, "transaction": <the transaction object or null>}} (if none, return an empty list).
2) Be concise, factual, and avoid hallucination. If you are unsure about a transaction, mark transaction field as null but explain why.
3) Use numbers when possible (totals, percentages) and keep language neutral.

Transactions (most recent first):
{tx_text}

Return valid JSON only. No extra commentary.
"""
    return prompt

# --- endpoint
@app.post("/generate-summary")
async def generate_summary(req: InsightRequest, x_api_key: Optional[str] = Header(None)):
    # simple auth: require SERVICE_API_KEY header from backend
    if SERVICE_API_KEY:
        if x_api_key != SERVICE_API_KEY:
            raise HTTPException(status_code=401, detail="Invalid service key")

    transactions = req.transactions
    # if transactions not provided, backend SHOULD provide them. Deny otherwise.
    if not transactions:
        raise HTTPException(status_code=400, detail="transactions are required in request body")

    # convert to plain dicts
    txs = [t.dict() for t in transactions]

    # basic heuristic anomalies (fast pre-check) to include in prompt if needed
    total_income = sum(t["amount"] for t in txs if t["amount"] and t["amount"] > 0)
    total_expense = sum(t["amount"] for t in txs if t["amount"] and t["amount"] < 0)
    # build prompt
    prompt = build_prompt(txs)

    try:
        content, model_used = call_openrouter_with_fallback(prompt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LLM request failed: {str(e)}")

    # try to parse JSON from content robustly
    parsed = None
    try:
        parsed = json.loads(content.strip())
    except Exception:
        # try to extract JSON substring
        try:
            start = content.index("{")
            end = content.rindex("}") + 1
            parsed = json.loads(content[start:end])
        except Exception:
            # fallback to returning raw content in 'raw' field
            parsed = {"raw": content}

    response = {
        "model_used": model_used,
        "summary": parsed.get("summary") if isinstance(parsed, dict) else None,
        "recommendations": parsed.get("recommendations") if isinstance(parsed, dict) else [],
        "anomalies": parsed.get("anomalies") if isinstance(parsed, dict) else [],
        "raw": parsed
    }
    return response

# --- run with uvicorn main:app --reload --port 8001
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=AI_PORT, reload=True)
