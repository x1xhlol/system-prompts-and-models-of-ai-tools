from __future__ import annotations
import json
from typing import Any, Dict, Generator, Iterable, Optional

import requests

from utils.rate_limit import request_with_retries


class UniversalAIClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({'Authorization': f'Bearer {token}'})

    def _json(self, method: str, path: str, json_body: Optional[Dict[str, Any]] = None, stream: bool = False) -> requests.Response:
        url = f"{self.base_url}{path}"
        headers = {}
        if not stream:
            headers['Content-Type'] = 'application/json'
        return request_with_retries(
            self.session.request,
            method=method,
            url=url,
            json=json_body,
            headers=headers,
            stream=stream,
        )

    def chat(self, message: str, **kwargs: Any) -> Dict[str, Any]:
        resp = self._json('POST', '/chat', { 'message': message, **kwargs })
        resp.raise_for_status()
        return resp.json()

    def stream_chat(self, message: str, optimize_prompt: bool = True) -> Generator[Dict[str, Any], None, None]:
        params = {
            'message': message,
            'optimizePrompt': 'true' if optimize_prompt else 'false'
        }
        url = f"{self.base_url}/stream"
        resp = request_with_retries(
            self.session.get,
            url=url,
            headers={'Accept': 'text/event-stream'},
            params=params,
            stream=True,
        )
        resp.raise_for_status()
        for line in resp.iter_lines(decode_unicode=True):
            if not line:
                continue
            if line.startswith('data: '):
                try:
                    yield json.loads(line[6:])
                except json.JSONDecodeError:
                    continue

    def get_conversations(self, limit: int = 50, offset: int = 0, user_id: Optional[str] = None) -> Dict[str, Any]:
        params: Dict[str, Any] = { 'limit': limit, 'offset': offset }
        if user_id:
            params['userId'] = user_id
        url = f"{self.base_url}/conversations"
        resp = request_with_retries(self.session.get, url=url, params=params)
        resp.raise_for_status()
        return resp.json()

    def rag_ingest(self, documents: Iterable[Dict[str, Any]], collection: str = 'knowledge_base') -> Dict[str, Any]:
        payload = { 'documents': list(documents), 'collection': collection }
        resp = self._json('POST', '/rag/ingest', payload)
        resp.raise_for_status()
        return resp.json()

    def rag_search(self, query: str, collection: str = 'knowledge_base', limit: int = 5, threshold: Optional[float] = None) -> Dict[str, Any]:
        payload: Dict[str, Any] = { 'query': query, 'collection': collection, 'limit': limit }
        if threshold is not None:
            payload['threshold'] = threshold
        resp = self._json('POST', '/rag/search', payload)
        resp.raise_for_status()
        return resp.json()

    def rag_answer(self, question: str, collection: str = 'knowledge_base', max_context: int = 3, include_context: bool = True) -> Dict[str, Any]:
        payload = { 'question': question, 'collection': collection, 'maxContext': max_context, 'includeContext': include_context }
        resp = self._json('POST', '/rag/answer', payload)
        resp.raise_for_status()
        return resp.json()

    def list_plugins(self) -> Dict[str, Any]:
        resp = request_with_retries(self.session.get, url=f"{self.base_url}/plugins")
        resp.raise_for_status()
        return resp.json()

    def execute_plugin(self, plugin_name: str, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        payload = { 'action': action, 'parameters': parameters }
        resp = self._json('POST', f"/plugins/{plugin_name}/execute", payload)
        resp.raise_for_status()
        return resp.json()