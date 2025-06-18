# Pontifex Augur
#### a Roman-style omen interpreter driven by llama.cpp.

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
```
pip install -r requirements.txt
```
### 4. Place Your Model

Download a quantized .gguf file (e.g. Meta-Llama-3-8B-Instruct) and place it in:

models/llama3-8B-q4_k_m.

run:
```
curl -L -o models/llama3-8B-q4_k_m.gguf \
  https://huggingface.co/bartowski/Meta-Llama-3-8B-Instruct-GGUF/resolve/main/Meta-Llama-3-8B-Instruct-Q4_K_M.gguf
```



## Usage

Basic Invocation
```
echo '{"species": "corvus corax", "side": "dexter"}' | python augur.py
```
Output will be a stylized Roman proclamation with the omen result.


## Dev Notes
	•	All llama.cpp output (Metal, ggml, perf) is suppressed.
	•	Augury rules live in augury_rules.yaml.
	•	Rule logic is handled by rules/engine.py.
	•	Inference uses llama_cpp.Llama with chat-style prompting.


## Project Structure
```
AuguryProject/
├── augur.py                 # Entry point
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

Roman Republic Public License
