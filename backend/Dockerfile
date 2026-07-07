# backend/Dockerfile

# 1. 베이스 이미지 선택
# Python 3.11 슬림 버전 — 불필요한 것 없이 가벼운 이미지
# 요리 비유: 기본 주방 설비가 갖춰진 빈 주방을 가져오는 것
FROM python:3.11-slim

# 2. 작업 디렉토리 설정
# 컨테이너 안에서 코드를 놓을 폴더
WORKDIR /app

# 3. 패키지 목록 먼저 복사 (캐싱 최적화)
# requirements.txt 가 변경되지 않으면 pip install 단계를 다시 실행하지 않음
COPY requirements.txt .
# 4. 패키지 설치
RUN pip install --no-cache-dir -r requirements.txt

# 5. 나머지 코드 복사
# .env 파일은 복사하지 않습니다 — docker run 시 환경변수로 주입
COPY . .

# 6. 포트 선언
# 컨테이너 내부에서 8000번 포트를 사용한다고 선언
EXPOSE 8080

# 7. 실행 명령
# docker run 시 자동으로 실행되는 명령어
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
#CMD uvicorn 'venv.lib.python3.11.site-packages.httpx._transports.asgi:application' --host=0.0.0.0 --port=8080
