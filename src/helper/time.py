import time


def curr_timestamp() -> int:
    timestamp = int(time.time() * 1000)
    return timestamp
