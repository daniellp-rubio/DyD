from typing import TypedDict, Optional


class JobEntry(TypedDict):
    status: str  # pending | generating | done | failed
    video_url: Optional[str]
    error: Optional[str]


# In-memory store — sufficient for local single-admin use.
# Jobs are lost on server restart (expected behavior for local dev).
job_store: dict[str, JobEntry] = {}
