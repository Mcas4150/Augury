# Pontifex Augur

![Augury](https://github.com/Mcas4150/Augury/blob/master/frontend/public/media/augury2.png)

A Roman omen interpreter driven by llama.cpp.

## Setup Instructions

### 1. Clone the Repo
```
git clone https://github.com/your-user/augury-project.git
cd augury-project
```
### 2. Create Virtual Environment (optional but recommended)
```
python3 -m venv .venv
source .venv/bin/activate
```
### 3. Install Dependencies
backend:
```
pip install -r requirements.txt
```
frontend:
```
cd frontend
npm install
```
### 4. Download Model

```
curl -L -o models/llama3-8B-q4_k_m.gguf \
  https://huggingface.co/bartowski/Meta-Llama-3-8B-Instruct-GGUF/resolve/main/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf
```


## Usage

Run Backend
```
uvicorn api:app --reload --port 8000
```
Run Fronend
```
cd frontend
npm run dev
```

Run Ollama
```
$env:OLLAMA_LOG_LEVEL = "debug"
>> $env:OLLAMA_HOST = "127.0.0.1:11435"
>> & "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" serve
```

## Dev Notes
	•	All llama.cpp output (Metal, ggml, perf) is suppressed.
	•	Augury rules live in augury_rules.yaml.
	•	Rule logic is handled by rules/engine.py.
	•	Inference uses llama_cpp.Llama with chat-style prompting.


## Project Structure
```
AuguryProject/
├── augur.py                 # Entry point
├── api.py                   # REST api
├── rules/
│   └── engine.py            # Rule engine logic
├── models/
│   └── llama3-8B-q4_k_m.gguf  # LLM file (not included)
├── augury_rules.yaml        # Rule definitions
├── README.md
└── .venv/                   # Optional virtualenv
```


## Credits

Created by Mike Cassidy + Kristian North.



## License

Res Publica License
