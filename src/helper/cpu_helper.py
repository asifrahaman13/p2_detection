import asyncio
from fastapi.concurrency import run_in_threadpool
from typing import Callable, Any
import functools


async def async_sleep(duration):
    await asyncio.sleep(duration)


async def run_blocking_io(func: Callable, *args, **kwargs) -> Any:
    return await run_in_threadpool(functools.partial(func, *args, **kwargs))
