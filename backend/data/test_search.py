# ChromaDB 저장 및 검색 테스트
# 실행: backend/ 폴더에서 python data/test_search.py

import chromadb
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAG_JSON = os.path.join(BASE_DIR, "rag_documents.json")
CHROMA_PATH = os.path.join(os.path.dirname(BASE_DIR), "chroma_db")

def load_rag_documents(json_path: str) -> list:
    """저장된 RAG 문서 JSON을 불러옵니다."""
    with open(json_path, "r", encoding="utf-8") as f:
        documents = json.load(f)
    print(f"✅ RAG 문서 {len(documents)}개 로드됨")
    return documents


def save_to_chromadb(documents: list, chroma_path: str) -> chromadb.Collection:
    """
    RAG 문서를 ChromaDB에 저장합니다.

    요리 비유:
    레시피 카드를 레시피 북(ChromaDB)에 정리해서 꽂아놓는 단계입니다.
    """
    print(f"\n=== ChromaDB 저장 ===")

    # PersistentClient: 데이터를 디스크에 영구 저장합니다
    # chroma_path 폴더에 자동으로 DB 파일이 생성됩니다
    client = chromadb.PersistentClient(path=chroma_path)

    # 컬렉션 생성 (이미 있으면 가져옴)
    # get_or_create_collection: 있으면 가져오고, 없으면 새로 만듭니다
    collection = client.get_or_create_collection(
        name="careerfit_jobs",
        metadata={"description": "CareerFit AI 취업·공모전 데이터"}
    )

    # 기존 데이터가 있으면 초기화 (재실행 시 중복 방지)
    existing_count = collection.count()
    if existing_count > 0:
        print(f"   기존 문서 {existing_count}개 발견 → 초기화 후 재저장합니다")
        # 기존 ID 조회 후 삭제
        existing = collection.get()
        if existing["ids"]:
            collection.delete(ids=existing["ids"])

    # 문서 저장 (배치 처리)
    texts = [doc["text"] for doc in documents]
    metadatas = [doc["metadata"] for doc in documents]
    ids = [doc["doc_id"] for doc in documents]

    collection.add(
        documents=texts,
        metadatas=metadatas,
        ids=ids
    )

    print(f"   ✅ {collection.count()}개 문서 저장 완료")
    print(f"   저장 위치: {chroma_path}")
    return collection


def test_search(collection: chromadb.Collection) -> None:
    """
    저장된 문서로 질문 기반 검색을 테스트합니다.

    요리 비유:
    레시피 북에 "오늘 닭고기에 어울리는 요리"를 검색하는 단계입니다.
    """
    print("\n=== ChromaDB 검색 테스트 ===")

    test_queries = [
        "데이터 분석 직무에 Python이 필요한 공고",
        "통계학과 학생에게 적합한 취업 공고",
        "백엔드 개발자 채용 공고",
    ]

    for query in test_queries:
        print(f"\n  질문: '{query}'")
        results = collection.query(
            query_texts=[query],
            n_results=2  # 가장 유사한 문서 2개 반환
        )

        for i, (doc, meta) in enumerate(
            zip(results["documents"][0], results["metadatas"][0])
        ):
            print(f"  결과 {i+1}:")
            print(f"    회사: {meta.get('company', '?')} | 직무: {meta.get('title', '?')}")
            print(f"    거리: {results['distances'][0][i]:.4f}")
            # 거리가 낮을수록 질문과 더 유사합니다
            print(f"    문서: {doc[:80]}...")


if __name__ == "__main__":
    documents = load_rag_documents(RAG_JSON)
    collection = save_to_chromadb(documents, CHROMA_PATH)
    test_search(collection)
    print("\n✅ ChromaDB 저장 및 검색 테스트 완료")