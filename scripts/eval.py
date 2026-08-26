"""
Evaluation script for VisionRAG.
Evaluates semantic retrieval quality, latency, and category match accuracy
across a benchmark suite of natural language queries.
"""

import sys
import time
from pathlib import Path
from typing import List, Dict

project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root / "backend"))

from app.services.embedding import EmbeddingService
from app.services.vector_store import VectorStoreService


BENCHMARK_QUERIES = [
    {
        "query": "a person riding a bicycle on a road",
        "expected_categories": ["bicycle", "person"],
    },
    {
        "query": "a dog sitting outdoors in the grass",
        "expected_categories": ["dog"],
    },
    {
        "query": "a cat resting on furniture",
        "expected_categories": ["cat", "couch", "bed", "chair"],
    },
    {
        "query": "food served on a dining table with drinks",
        "expected_categories": ["dining table", "pizza", "bottle", "cup", "sandwich", "bowl"],
    },
    {
        "query": "an airplane flying in the sky or on runway",
        "expected_categories": ["airplane"],
    },
    {
        "query": "a train moving on railroad tracks",
        "expected_categories": ["train"],
    },
    {
        "query": "people playing tennis on a court with a racket",
        "expected_categories": ["tennis racket", "sports ball", "person"],
    },
    {
        "query": "a motorcycle parked on a street",
        "expected_categories": ["motorcycle"],
    },
]


def run_evaluation(top_k: int = 10):
    print("==================================================")
    print(" VisionRAG — Retrieval Quality Benchmark")
    print("==================================================")

    emb = EmbeddingService()
    emb.load()

    vstore = VectorStoreService()
    vstore.connect()

    stats = vstore.get_collection_stats()
    print(f"Collection status: {stats}\n")

    total_queries = len(BENCHMARK_QUERIES)
    passed_queries = 0
    latencies: List[float] = []

    print(f"{'Query':<45} | {'Match@Top5':<10} | {'Latency':<9} | {'Top Score':<9}")
    print("-" * 80)

    for item in BENCHMARK_QUERIES:
        query = item["query"]
        expected_cats = set(item["expected_categories"])

        t0 = time.perf_counter()
        vec = emb.encode_text(query)
        results = vstore.search_by_vector(vec, top_k=top_k, score_threshold=0.0)
        dt_ms = (time.perf_counter() - t0) * 1000.0
        latencies.append(dt_ms)

        # Check if any top 5 retrieved items share expected categories
        top_5 = results[:5]
        retrieved_cats = set()
        for r in top_5:
            retrieved_cats.update(r.categories)

        overlap = retrieved_cats.intersection(expected_cats)
        is_hit = len(overlap) > 0
        if is_hit:
            passed_queries += 1

        top_score = results[0].match_percentage if results else "N/A"
        status_str = "PASS" if is_hit else "FAIL"

        print(f"{query[:43]:<45} | {status_str:<10} | {dt_ms:6.1f} ms | {top_score:<9}")

    avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
    accuracy = (passed_queries / total_queries) * 100.0 if total_queries else 0.0

    print("-" * 80)
    print(f"Total Benchmark Queries : {total_queries}")
    print(f"Hits @ Top-5            : {passed_queries}/{total_queries} ({accuracy:.1f}%)")
    print(f"Average Search Latency  : {avg_latency:.1f} ms")
    print("==================================================")


if __name__ == "__main__":
    run_evaluation()
