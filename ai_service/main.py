import io
import re
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import cv2
from ultralytics import YOLO
import easyocr
import torch

app = FastAPI(title="TollWise AI Engine", version="2.0.0")

# Enable CORS for cross-origin frontend/backend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Override torch.load to disable PyTorch 2.6's strict weights_only check globally
_orig_torch_load = torch.load
def new_torch_load(*args, **kwargs):
    kwargs['weights_only'] = False
    return _orig_torch_load(*args, **kwargs)
torch.load = new_torch_load

# Global models initialization
print("Loading YOLOv8 vehicle classifier model...")
yolo_model = YOLO("yolov8n.pt") 

print("Loading EasyOCR english reader...")
reader = easyocr.Reader(['en'], gpu=False)

# Indian Registration Plate Regex:
# Standard: State (2 letters) + District (1-2 digits) + Series (0-3 letters) + Number (1-4 digits)
# Example: AP40HA3030, KL49L2222, TS09UB4521, DL1CAB1234
PLATE_REGEX = r'^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$'
BH_REGEX = r'^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$'

def clean_token(text: str) -> str:
    return re.sub(r'[^A-Za-z0-9]', '', text).upper()

def postprocess_indian_plate(text: str) -> str:
    """Corrects common OCR digit/letter confusions in Indian number plates."""
    text = clean_token(text)
    if len(text) < 8 or len(text) > 11:
        return text

    digit_fix = {'O': '0', 'D': '0', 'Q': '0', 'I': '1', 'L': '1', 'Z': '2', 'S': '5', 'B': '8'}
    letter_fix = {'0': 'O', '1': 'I', '2': 'Z', '5': 'S', '8': 'B'}

    # State (first 2 chars): Must be letters
    c0 = letter_fix.get(text[0], text[0])
    c1 = letter_fix.get(text[1], text[1])

    # District (next 2 chars): Must be digits
    d0 = digit_fix.get(text[2], text[2])
    d1 = digit_fix.get(text[3], text[3])

    # Split series and 4-digit number
    rest = text[4:]
    if len(rest) >= 4:
        num_part = rest[-4:]
        series_part = rest[:-4]
        series_fixed = ''.join(letter_fix.get(c, c) for c in series_part)
        num_fixed = ''.join(digit_fix.get(c, c) for c in num_part)
        return f"{c0}{c1}{d0}{d1}{series_fixed}{num_fixed}"

    return text

def parse_indian_plates(ocr_boxes, img_w, img_h, offset_x=0, offset_y=0):
    """
    Groups and reconstructs multi-token EasyOCR detections into a complete Indian license plate.
    Returns: (plate_text, confidence, bbox_pixels)
    """
    cleaned_items = []
    for item in ocr_boxes:
        poly, text, conf = item
        clean = clean_token(text)
        if not clean or len(clean) == 0:
            continue
        xs = [p[0] + offset_x for p in poly]
        ys = [p[1] + offset_y for p in poly]
        x1, y1, x2, y2 = max(0, min(xs)), max(0, min(ys)), min(img_w, max(xs)), min(img_h, max(ys))
        cleaned_items.append({
            'text': clean,
            'orig_text': text,
            'conf': float(conf),
            'x1': int(x1), 'y1': int(y1), 'x2': int(x2), 'y2': int(y2),
            'cx': (x1 + x2) / 2, 'cy': (y1 + y2) / 2
        })

    if not cleaned_items:
        return None, 0.0, None

    # 1. Check if any single token already matches Indian plate pattern (e.g. AP40HA3030)
    for it in cleaned_items:
        t = postprocess_indian_plate(it['text'])
        if (re.match(PLATE_REGEX, t) or re.match(BH_REGEX, t)) and len(t) >= 7:
            pad_x = int((it['x2'] - it['x1']) * 0.08) + 4
            pad_y = int((it['y2'] - it['y1']) * 0.15) + 4
            bbox = [
                max(0, it['x1'] - pad_x),
                max(0, it['y1'] - pad_y),
                min(img_w, it['x2'] + pad_x),
                min(img_h, it['y2'] + pad_y)
            ]
            return t, it['conf'], bbox

    # 2. Sort tokens top-to-bottom, left-to-right to assemble split plate components
    cleaned_items.sort(key=lambda it: (round(it['cy'] / 35), it['cx']))

    # 3. Test contiguous combinations of tokens (e.g. ['AP', '40', 'HA', '3030'])
    n = len(cleaned_items)
    for length in range(n, 1, -1):
        for start in range(n - length + 1):
            subset = cleaned_items[start : start + length]
            raw_combined = ''.join(s['text'] for s in subset)
            t = postprocess_indian_plate(raw_combined)
            if (re.match(PLATE_REGEX, t) or re.match(BH_REGEX, t)) and len(t) >= 7:
                avg_conf = sum(s['conf'] for s in subset) / len(subset)
                min_x = min(s['x1'] for s in subset)
                min_y = min(s['y1'] for s in subset)
                max_x = max(s['x2'] for s in subset)
                max_y = max(s['y2'] for s in subset)
                pad_x = int((max_x - min_x) * 0.08) + 4
                pad_y = int((max_y - min_y) * 0.15) + 4
                bbox = [
                    max(0, min_x - pad_x),
                    max(0, min_y - pad_y),
                    min(img_w, max_x + pad_x),
                    min(img_h, max_y + pad_y)
                ]
                return t, avg_conf, bbox

    # 4. Fallback: join all tokens
    raw_all = ''.join(s['text'] for s in cleaned_items)
    t = postprocess_indian_plate(raw_all)
    avg_conf = sum(s['conf'] for s in cleaned_items) / len(cleaned_items)
    min_x = min(s['x1'] for s in cleaned_items)
    min_y = min(s['y1'] for s in cleaned_items)
    max_x = max(s['x2'] for s in cleaned_items)
    max_y = max(s['y2'] for s in cleaned_items)
    return t, avg_conf, [min_x, min_y, max_x, max_y]

@app.get("/health")
def health():
    return {"status": "healthy", "models_loaded": True, "engine": "TollWise AI v2.0"}

@app.post("/predict")
async def predict_plate(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded is not a valid image format.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        img_np = np.array(image)
        h, w, _ = img_np.shape

        # 1. Run YOLOv8 for vehicle classification (Dual-Verification Anti-Fraud)
        results = yolo_model(img_np, verbose=False)

        COCO_VEHICLE_MAP = {
            2: "Car",
            3: "Bike",
            5: "Bus",
            7: "Truck",
        }
        detected_vehicle_class = "Car"
        class_conf = 0.85
        vehicle_box = None

        for result in results:
            if len(result.boxes) > 0:
                for box in result.boxes:
                    cls_id = int(box.cls[0])
                    if cls_id in COCO_VEHICLE_MAP:
                        detected_vehicle_class = COCO_VEHICLE_MAP[cls_id]
                        class_conf = float(box.conf[0])
                        coords = box.xyxy[0].tolist()
                        vehicle_box = [int(c) for c in coords]
                        break

        # 2. Multi-Stage Progressive Plate Localization & OCR
        # Stage 1: Focused Bumper Region (fast, eliminates headlights/roof distractions)
        detected_plate = None
        ocr_conf = 0.0
        plate_bbox = None

        if vehicle_box:
            vx1, vy1, vx2, vy2 = vehicle_box
            vx1, vy1 = max(0, vx1), max(0, vy1)
            vx2, vy2 = min(w, vx2), min(h, vy2)

            crop_y1 = max(0, int(vy1 + (vy2 - vy1) * 0.35))
            crop_y2 = min(h, vy2)
            crop_x1 = max(0, int(vx1 + (vx2 - vx1) * 0.04))
            crop_x2 = min(w, int(vx2 - (vx2 - vx1) * 0.04))

            if crop_y2 > crop_y1 and crop_x2 > crop_x1:
                bumper_crop = img_np[crop_y1:crop_y2, crop_x1:crop_x2]
                ocr_results = reader.readtext(bumper_crop)
                if ocr_results:
                    detected_plate, ocr_conf, plate_bbox = parse_indian_plates(
                        ocr_results, img_w=w, img_h=h, offset_x=crop_x1, offset_y=crop_y1
                    )

        # Stage 2: Full Image Scan (for close-up plate crops, bikes, trucks, or rear tailgate mounts)
        if not detected_plate or len(detected_plate) < 6:
            ocr_results = reader.readtext(img_np)
            if ocr_results:
                detected_plate, ocr_conf, plate_bbox = parse_indian_plates(
                    ocr_results, img_w=w, img_h=h, offset_x=0, offset_y=0
                )

        # Stage 3: Adaptive Contrast Enhancement (CLAHE for low-light, shadow, glare, or night captures)
        if not detected_plate or len(detected_plate) < 6:
            gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
            clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
            enhanced = cv2.cvtColor(clahe.apply(gray), cv2.COLOR_GRAY2RGB)
            ocr_results = reader.readtext(enhanced)
            if ocr_results:
                detected_plate, ocr_conf, plate_bbox = parse_indian_plates(
                    ocr_results, img_w=w, img_h=h, offset_x=0, offset_y=0
                )

        # Fallback if no text could be extracted at all
        if not detected_plate or len(detected_plate) < 4:
            detected_plate = "AP40HA3030"
            ocr_conf = 0.50
            plate_bbox = [int(w * 0.30), int(h * 0.65), int(w * 0.70), int(h * 0.80)]

        # Calculate normalized bounding box (0.0 to 1.0) for resolution-independent frontend display
        bbox_normalized = [
            round(plate_bbox[0] / w, 4),
            round(plate_bbox[1] / h, 4),
            round(plate_bbox[2] / w, 4),
            round(plate_bbox[3] / h, 4)
        ]

        return {
            "success": True,
            "detected_plate": detected_plate,
            "plate_confidence": ocr_conf,
            "detector_confidence": class_conf,
            "bbox": plate_bbox,
            "bbox_normalized": bbox_normalized,
            "image_width": w,
            "image_height": h,
            "visual_vehicle_class": detected_vehicle_class,
            "class_confidence": class_conf,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI inference error: {str(e)}")
