from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from augur import omen, get_llm     # lazy loader exposed

app = FastAPI(title="Augury API", docs_url="/docs")

class OmenRequest(BaseModel):
    species: str
    side: str

class OmenResponse(BaseModel):
    proclamation: str

@app.post("/proclaim", response_model=OmenResponse)
def proclaim(req: OmenRequest):
    try:
        # Ensure model is loaded on first call only
        get_llm()
        text = omen(req.dict())
        return {"proclamation": text}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
