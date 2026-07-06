from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import health, jobs, analyze

# react에서 요청을 보내 -> fetch("http://localhost:8080/") = 브라우저 -> http:localhost:8080으로 get 요청
# 그럼 fastapi에 도착하면 가장먼저 Middleware를 지남. fastapi 내부에서 요청 -> CORSMIDDLEWARE -> 라우터(@app.get) -> 함수실행
# 여기서 allow_origins=["http://localhost:5173"]이므로 브라우저가 Origin: http://localhost:5173에서 왔다면 이 요청은 허용! 판단
# MIDDLEWARE 통과하면 라우터 실행
# 그러면 {"message": "CareerFit AI 서버가 실행 중입니다."}반환 -> 응답 
# 응답도 middleware를 지나 브라우저로 감 응답 = root() -> Response 생성 -> CORSMIDDLEWARE -> 브라우저
# 여기서 Middleware는 응답헤더에 Access-Control-Allow-Origin:, http://localhost:5173 같은 CORS 헤더 붙여줌
# = 아 이서버가 5173에서 오는 요청을 허용했구나~ 하고 react에게 응답을 넘겨줌


# FastAPI 앱 객체 생성
# title과 version은 /docs 페이지에 표시된다
app = FastAPI(
title="CareerFit AI",
description="취업·공모전 데이터 기반 맞춤형 AI 포트폴리오 코치",
version="0.1.0"
)


# CORS 설정: React 프론트엔드(localhost:5173)의 요청을 허용한다
# React와 FastAPI가 서로 통신하려고 middleware가 있는거임.
# 웹 프론트엔드 featch('http://localhost:8080/') 호출하면 CORSMIDDLEWARE에서 http://localhost:5173으로부터 오는 요청은 허용하겠다 선언
# 최종적으로 frontend 요청 -> middleware -> fastapi 라우트(@app.get) -> middleware -> frontend
# 요리 비유: 다른 건물(프론트엔드)에서 오는 배달 요청을 허용하는 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?",
    allow_credentials=True, #쿠키 인증 정보 포함 요청 허용
    allow_methods=["*"], # GET, POST, PUT, DELETE, OPTIONS 등 모든 메서드 허용
    allow_headers=["*"], # Content-Type, Authorization 등 모든 헤더 허용
)

#라우터 등록
app.include_router(health.router) # 엔드포인트 두개가 생김 '/', 'health'
app.include_router(jobs.router) # 엔드포인트 3개가 생김 '/', 'health', 'jobs'
app.include_router(analyze.router) # 엔드포인트 4개가 생김 '/', 'health', 'jobs', 'analyze'

# 라우터 등록은 실습 4·5·6에서 추가한다
# 엔드포인트 라우트
# url에 get 요청이 오면 root()가 실행되도록 경로 하나를 등록한 것.
@app.get("/")
def root():
    return {"message": "CareerFit AI 서버가 실행 중입니다."}
    