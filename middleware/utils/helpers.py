import os
import uuid
import zipfile
import shutil
from fastapi import HTTPException
from typing import Dict, List, Any
import json
from datetime import datetime

def generate_unique_id() -> str:
    """Generate a unique ID for sessions and other entities"""
    return str(uuid.uuid4())

def ensure_directory_exists(directory_path: str) -> str:
    """Ensure that a directory exists and return its path"""
    os.makedirs(directory_path, exist_ok=True)
    return directory_path

def extract_zip(zip_file_path: str, extract_to: str) -> None:
    """Extract a ZIP file to the specified directory"""
    try:
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP file")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting ZIP file: {str(e)}")

def create_zip(directory_path: str, output_path: str) -> str:
    """Create a ZIP file from a directory"""
    try:
        shutil.make_archive(
            os.path.splitext(output_path)[0],  # Remove .zip extension
            'zip',
            directory_path
        )
        return output_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating ZIP file: {str(e)}")

def clean_temp_files(file_paths: List[str]) -> None:
    """Clean up temporary files and directories"""
    for path in file_paths:
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
            elif os.path.isfile(path):
                os.remove(path)
        except Exception as e:
            # Log but don't fail if cleanup fails
            print(f"Warning: Failed to clean up {path}: {e}")

def read_json_file(file_path: str) -> Dict[str, Any]:
    """Read and parse a JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail=f"Invalid JSON in file: {file_path}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file {file_path}: {str(e)}")

def save_json_file(file_path: str, data: Dict[str, Any]) -> None:
    """Save data to a JSON file"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file {file_path}: {str(e)}")

def format_datetime(dt: datetime) -> str:
    """Format a datetime object for display"""
    return dt.strftime('%Y-%m-%d %H:%M:%S')