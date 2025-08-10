import json, requests
from typing import Optional, Dict, Any

class OllamaEngine:
    def __init__(self, base_url: str, model: str):
        self.url = base_url.rstrip("/") + "/api/generate"
        self.model = model

    def generate(
        self,
        prompt: str,
        *,
        max_tokens: int,
        temperature: float,
        stop: Optional[list[str]] = None,
        options: Optional[Dict[str, Any]] = None,
    ) -> str:
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature,
            },
        }
        if options:
            payload["options"].update(options)
        if stop:
            payload["stop"] = stop

        r = requests.post(self.url, json=payload, timeout=600)
        r.raise_for_status()
        data = r.json()
        return data.get("response", "")
