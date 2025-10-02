import time
import random
from typing import Callable, Dict, Any


def request_with_retries(sender: Callable[..., Any], max_retries: int = 4, base_delay: float = 0.5, backoff: float = 2.0, max_delay: float = 8.0, **kwargs) -> Any:
    """
    rate-limit-safe request wrapper. Expects `sender` to be a callable like
    `session.request(method, url, **kwargs)` returning a `requests.Response`.
    Retries on HTTP 429 and 5xx. Honors Retry-After header when present.
    """
    attempt = 0
    while True:
        try:
            resp = sender(**kwargs)
            if resp.status_code != 429 and resp.status_code < 500:
                return resp
            if attempt >= max_retries:
                return resp
            retry_after = resp.headers.get('Retry-After')
            delay_from_header = 0.0
            if retry_after is not None:
                try:
                    delay_from_header = float(retry_after)
                except ValueError:
                    delay_from_header = 0.0
            backoff_delay = min(base_delay * (backoff ** attempt), max_delay)
            delay = max(delay_from_header, backoff_delay) + random.uniform(0, 0.25)
            time.sleep(delay)
            attempt += 1
        except Exception:
            if attempt >= max_retries:
                raise
            backoff_delay = min(base_delay * (backoff ** attempt), max_delay)
            time.sleep(backoff_delay + random.uniform(0, 0.25))
            attempt += 1