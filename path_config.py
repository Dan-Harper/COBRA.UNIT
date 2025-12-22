import os
import platform

def get_project_root():
    """
    Detect the operating system and return the appropriate project root path.

    Returns:
        str: The absolute path to the project root directory
    """
    system = platform.system()

    if system == "Windows":
        # Windows path
        return "C:/Users/Wanderer/Documents/OSU-GT-STANFORD/COBRA.UNIT"
    elif system == "Darwin":  # macOS
        # Mac path
        return "/Users/wanderer/Desktop/PQR/COBRA.UNIT"
    else:  # Linux or other Unix-like systems
        # You can customize this for Linux if needed
        return "/Users/wanderer/Desktop/PQR/COBRA.UNIT"

def get_path(*path_parts):
    """
    Build a path relative to the project root.

    Args:
        *path_parts: Variable number of path components to join

    Returns:
        str: The complete path joined with the project root

    Example:
        get_path('!README', 'pqr-backend-output-files')
        -> 'C:/Users/Wanderer/Documents/OSU-GT-STANFORD/COBRA.UNIT/!README/pqr-backend-output-files' (Windows)
        -> '/Users/wanderer/Desktop/PQR/COBRA.UNIT/!README/pqr-backend-output-files' (Mac)
    """
    return os.path.join(get_project_root(), *path_parts)

# Commonly used paths
PROJECT_ROOT = get_project_root()
README_DIR = get_path('!README')
PQR_BACKEND_OUTPUT_DIR = get_path('!README', 'pqr-backend-output-files')
PQR_TICKERS_BATCH_DIR = get_path('!README', 'pqr-tickers-batch-files')
MONO_SCRAPER_OUTPUT_DIR = get_path('!README', 'mono-scraper-output')
BETA_FILTER_SCRIPT = get_path('app', 'betaFilter', 'betaFilter.py')

# Print configuration on import (for debugging)
if __name__ == "__main__":
    print(f"Detected OS: {platform.system()}")
    print(f"Project Root: {PROJECT_ROOT}")
    print(f"README Directory: {README_DIR}")
    print(f"PQR Backend Output: {PQR_BACKEND_OUTPUT_DIR}")
    print(f"PQR Tickers Batch: {PQR_TICKERS_BATCH_DIR}")
    print(f"Mono Scraper Output: {MONO_SCRAPER_OUTPUT_DIR}")
    print(f"Beta Filter Script: {BETA_FILTER_SCRIPT}")
