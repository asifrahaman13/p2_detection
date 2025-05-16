import logging
import os
from datetime import datetime


class Logger:
    def __init__(
        self,
        name: str = "app_logger",
        log_dir: str = "logs",
        log_file: str = None,
        level: int = logging.INFO,
        console_output: bool = True,
    ):
        os.makedirs(log_dir, exist_ok=True)

        if log_file is None:
            log_file = f"{datetime.now().strftime('%Y-%m-%d')}.log"

        log_path = os.path.join(log_dir, log_file)

        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)
        self.logger.propagate = False

        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s - %(name)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

        file_handler = logging.FileHandler(log_path)
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

        if console_output:
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)

    def get_logger(self):
        return self.logger
