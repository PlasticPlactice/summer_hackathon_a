import os
import shutil
from pathlib import Path
from datetime import datetime


# 画像保存ディレクトリ
TEMP_IMAGE_DIR = "./temp_images"
PARKING_IMAGE_DIR = "./parking_images"


def ensure_directories():
    """保存ディレクトリが存在することを確認"""
    Path(TEMP_IMAGE_DIR).mkdir(parents=True, exist_ok=True)
    Path(PARKING_IMAGE_DIR).mkdir(parents=True, exist_ok=True)


def save_temp_image(file_content: bytes, filename: str) -> str:
    """
    一時画像を保存
    プレビュー用の画像をtemporaryディレクトリに保存
    
    Args:
        file_content: 画像ファイルの内容（バイナリ）
        filename: ファイル名
    
    Returns:
        保存先のパス
    """
    ensure_directories()
    
    # タイムスタンプを付加してファイル名を生成
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    name_without_ext = Path(filename).stem
    ext = Path(filename).suffix
    unique_filename = f"{name_without_ext}_{timestamp}{ext}"
    
    temp_path = os.path.join(TEMP_IMAGE_DIR, unique_filename)
    
    with open(temp_path, "wb") as f:
        f.write(file_content)
    
    return temp_path


def save_parking_image(temp_image_path: str, parking_id: int) -> str:
    """
    一時画像を正式な駐車場画像ディレクトリに移動
    
    Args:
        temp_image_path: 一時画像のパス
        parking_id: 駐車場ID
    
    Returns:
        正式な保存先パス
    """
    ensure_directories()
    
    if not os.path.exists(temp_image_path):
        raise FileNotFoundError(f"Temporary image not found: {temp_image_path}")
    
    # 駐車場ID用のディレクトリを作成
    parking_dir = os.path.join(PARKING_IMAGE_DIR, str(parking_id))
    Path(parking_dir).mkdir(parents=True, exist_ok=True)
    
    # ファイル名を生成
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    original_filename = Path(temp_image_path).name
    final_filename = f"parking_{timestamp}.jpg"
    
    final_path = os.path.join(parking_dir, final_filename)
    
    # 一時ファイルを移動
    shutil.move(temp_image_path, final_path)
    
    return final_path


def delete_temp_image(temp_image_path: str) -> None:
    """
    一時画像を削除
    
    Args:
        temp_image_path: 一時画像のパス
    """
    if os.path.exists(temp_image_path):
        os.remove(temp_image_path)
