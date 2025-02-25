// Canvas और File Input को Select करें
const canvas = document.getElementById('pdfCanvas');
const fileInput = document.getElementById('fileInput');
const editBox = document.getElementById('editBox');
const editedText = document.getElementById('editedText');

let selectedWord = null;
let words = []; // OCR से मिले Words को Store करें
const fabricCanvas = new fabric.Canvas('pdfCanvas'); // Fabric.js Initialize करें

// Step 1: File Upload Handle
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    
    // Image Display
    const img = new Image();
    img.src = url;
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        runOCR(img); // OCR चलाएँ
    };
});

// Step 2: OCR से Text डिटेक्ट करें
async function runOCR(image) {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // OCR चलाएँ
    const { data: { words: detectedWords } } = await worker.recognize(image);
    console.log("Detected Text:", detectedWords);
    words = detectedWords; // Words को Global Variable में Store करें
    
    // हर Word का Bounding Box Canvas पर दिखाएँ
    words.forEach(word => {
        const { x0, y0, x1, y1 } = word.bbox;
        drawBox(x0, y0, x1 - x0, y1 - y0);
    });
    
    await worker.terminate(); // Worker को बंद करें
}

// Step 3: Bounding Box बनाएँ
function drawBox(x, y, width, height) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
}

// Step 4: Canvas पर Click करने पर Edit Box दिखाएँ
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Detect कौनसे Word पर Click हुआ है
    selectedWord = findClickedWord(x, y);
    
    // अगर Word मिला तो Edit Box दिखाएँ
    if (selectedWord) {
        showEditBox(selectedWord);
    }
});

// Step 5: Click किए गए Word को ढूँढें
function findClickedWord(x, y) {
    for (const word of words) {
        if (x >= word.x0 && x <= word.x1 && y >= word.y0 && y <= word.y1) {
            return word; // Match हुआ Word Return करें
        }
    }
    return null; // कोई Word नहीं मिला तो null Return करें
}

// Step 6: Edit Box दिखाएँ
function showEditBox(word) {
    editBox.style.left = `${word.x0}px`;
    editBox.style.top = `${word.y0}px`;
    editBox.classList.remove('hidden');
}

// Step 7: Edit किया Text Save करें
function saveEdit() {
    const newText = editedText.value;
    
    // नया Text उसी स्टाइल में Add करें
    const text = new fabric.Text(newText, {
        left: selectedWord.x0,
        top: selectedWord.y0,
        fontSize: 20,
        fill: 'black',
    });
    
    fabricCanvas.add(text); // Canvas पर Text Add करें
    editBox.classList.add('hidden'); // Edit Box Hide करें
}

// Step 8: Edited PDF Download करें
function exportPDF() {
    const editedImage = fabricCanvas.toDataURL('image/jpeg'); // Canvas को Image में Convert करें
    const pdf = new jsPDF();
    pdf.addImage(editedImage, 'JPEG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
    pdf.save('edited-marksheet.pdf'); // PDF Download करें
}
