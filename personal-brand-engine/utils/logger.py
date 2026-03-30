"""Structured logging with Arabic-friendly UTF-8 encoding."""

from __future__ import annotations

import logging
import sys
from functools import lru_cache

from config.settings import get_settings


class _StructuredFormatter(logging.Formatter):
    """Simple key=value structured formatter that safely handles Unicode."""

    def format(self, record: logging.LogRecord) -> str:
        base = super().format(record)
        # Append any extra keyword pairs passed via logger.info("msg", key=val, ...)
        extras = {
            k: v
            for k, v in record.__dict__.items()
            if k not in logging.LogRecord("").__dict__ and k != "message"
        }
        if extras:
            pairs = " ".join(f"{k}={v!r}" for k, v in extras.items())
            return f"{base} | {pairs}"
        return base


class _StructuredLogger(logging.Logger):
    """Logger subclass that accepts arbitrary kwargs and stores them on the record."""

    def _log(  # type: ignore[override]
        self,
        level: int,
        msg: object,
        args: tuple,  # type: ignore[override]
        exc_info=None,
        extra=None,
        stack_info: bool = False,
        stacklevel: int = 1,
        **kwargs,
    ) -> None:
        if extra is None:
            extra = {}
        extra.update(kwargs)
        super()._log(
            level,
            msg,
            args,
            exc_info=exc_info,
            extra=extra,
            stack_info=stack_info,
            stacklevel=stacklevel,
        )


# Register our custom logger class globally.
logging.setLoggerClass(_StructuredLogger)


def _build_handler() -> logging.StreamHandler:
    """Create a stream handler that writes UTF-8 to stdout."""
    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(
        _StructuredFormatter(
            fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    # Force UTF-8 so Arabic / non-ASCII text renders correctly.
    if hasattr(handler.stream, "reconfigure"):
        handler.stream.reconfigure(encoding="utf-8")
    return handler


@lru_cache(maxsize=None)
def get_logger(name: str = "brand_engine") -> logging.Logger:
    """Return a configured :class:`logging.Logger`.

    The log level is read from ``settings.log_level`` (default ``INFO``).
    All output is UTF-8 encoded so Arabic and other non-ASCII characters
    are rendered correctly.
    """
    settings = get_settings()
    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    log = logging.getLogger(name)
    if not log.handlers:
        log.addHandler(_build_handler())
    log.setLevel(level)
    log.propagate = False
    return log
