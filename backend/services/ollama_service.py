import requests

def get_ollama_response(prompt: str, model: str = "llama3.2:3b") -> str:

    """Ollama 로컬 추론 서버에 요청을 보냅니다."""

    try:

        response = requests.post(

            "http://localhost:11434/api/generate",

            json={

                "model": model,

                "prompt": prompt,

                "stream": False

            },

            timeout=60 # 로컬 모델은 응답에 시간이 걸릴 수 있습니다

        )

        response.raise_for_status()

        return response.json()["response"]

    except requests.exceptions.ConnectionError:

        return "[오류] Ollama 서버에 연결할 수 없습니다. ollama serve 명령으로 서버를 실행하세요."

    except requests.exceptions.Timeout:

        return "[오류] 응답 시간 초과. 더 작은 모델(tinyllama)을 시도해보세요."