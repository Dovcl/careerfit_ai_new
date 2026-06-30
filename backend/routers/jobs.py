from fastapi import APIRouter

from typing import List

router = APIRouter()



# 목업 데이터: 3일차에 실제 CSV 데이터로 교체한다

MOCK_JOBS = [
    {
        "id": 1,
        "company": "현대모비스",
        "title": "자율주행 인지 AI 엔지니어",
        "required_skills": ["Python", "PyTorch", "Computer Vision", "Sensor Fusion", "C++"],
        "preferred_skills": ["LiDAR", "Camera-Radar Fusion", "ROS2", "ONNX"],
        "description": "카메라, LiDAR, 레이더 등 멀티모달 센서 데이터를 융합해 주변 환경을 인식하는 AI 모델을 개발합니다. 실시간 객체 검출·추적 및 자율주행 인지 스택 고도화에 참여하게 됩니다.",
        "deadline": "2026-08-31"
    },
    {
        "id": 2,
        "company": "삼성전자",
        "title": "온디바이스 AI 연구원",
        "required_skills": ["Python", "PyTorch", "Deep Learning", "Model Quantization", "Self-Supervised Learning"],
        "preferred_skills": ["Knowledge Distillation", "TensorRT", "Mobile/Edge AI", "NAS"],
        "description": "스마트폰·가전 등 엣지 디바이스에서 동작하는 경량 AI 모델을 연구·개발합니다. Self-Supervised Learning 기반 사전학습과 양자화·증류 기법을 활용해 추론 속도와 메모리 효율을 개선하는 업무를 담당합니다.",
        "deadline": "2026-08-15"
    },
    {
        "id": 3,
        "company": "네이버클라우드",
        "title": "멀티모달 AI 연구 개발자",
        "required_skills": ["Python", "PyTorch", "Computer Vision", "NLP", "Multimodal Learning"],
        "preferred_skills": ["Vision-Language Model", "Transformers", "CLIP", "RAG"],
        "description": "이미지·텍스트·음성을 함께 이해하는 멀티모달 AI 모델을 설계하고 학습 파이프라인을 구축합니다. 클라우드 기반 AI 서비스에 적용 가능한 CV·NLP 융합 모델 연구 및 프로덕션 배포까지 참여합니다.",
        "deadline": "2026-08-01"
    }
]



@router.get("/jobs", tags=["Jobs"])

def get_jobs():

    """

    취업 공고 목록을 반환하는 엔드포인트.

    현재는 목업 데이터를 반환하며, 3일차에 실제 데이터로 교체한다.

    """

    return {

        "count": len(MOCK_JOBS),

        "jobs": MOCK_JOBS

    }



@router.get("/jobs/{job_id}", tags=["Jobs"])

def get_job_by_id(job_id: int):

    """

    특정 공고의 상세 정보를 반환한다.

    """

    for job in MOCK_JOBS:

        if job["id"] == job_id:

            return job

    # 찾지 못한 경우

    from fastapi import HTTPException

    raise HTTPException(status_code=404, detail=f"공고 ID {job_id}를 찾을 수 없습니다.")