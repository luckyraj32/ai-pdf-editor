// Canvas और File Input को Select करें
const canvas = document.getElementById('pdfCanvas');
const fileInput = document.getElementById('fileInput');
const editBox = document.getElementById('editBox');
const editedText = document.getElementById('editedText');

let selectedWord = null;

// Step 1: File Upload Handle
fileInput.addEventListener('change', async function runOCR(image) {
    // Tesseract Worker बनाएँ
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng'); // English Language Load करें
    await worker.initialize('eng');   // English Language Initialize करें
    
    // OCR चलाएँ (Image से Text पहचानें)
    const { data: { text, words } } = await worker.recognize(image);
    console.log("Detected Text:", text); // Console पर Text दिखाएँ
    
    // हर Word का Bounding Box Canvas पर दिखाएँ
    words.forEach(word => {
        const { x0, y0, x1, y1 } = word.bbox; // Word की Position और Size
        drawBox(x0, y0, x1 - x0, y1 - y0);    // Bounding Box बनाएँ
    });
}

// Bounding Box बनाने का Function
function drawBox(x, y, width, height) {
    const ctx = canvas.getContext('2d'); // Canvas का Context लें
    ctx.strokeStyle = 'red';            // लाल रंग की Border
    ctx.lineWidth = 2;                  // Border की मोटाई
    ctx.strokeRect(x, y, width, height); // चौकोर घेरा बनाएँ
} async (e) => {
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
        let selectedWord = null; // यूजर ने कौनसा Word Select किया है

// Canvas पर Click Event जोड़ें
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect(); // Canvas की Position पाएँ
    const x = e.clientX - rect.left;            // Click की X Position
    const y = e.clientY - rect.top;             // Click की Y Position
    
    // Detect कौनसे Word पर Click हुआ है
    selectedWord = findClickedWord(x, y);
    
    // अगर Word मिला तो Edit Box दिखाएँ
    if (selectedWord) {
        showEditBox(selectedWord);
        // Fabric.js Canvas Initialize करें
const fabricCanvas = new fabric.Canvas('pdfCanvas');

// Save Button का Function
function saveEdit() {
    const newText = document.getElementById('editedText').value; // Edit Box का Text पाएँ
    
    // नया Text उसी स्टाइल में Add करें
    const text = new fabric.Text(newText, {
        left: selectedWord.x0,      // X Position
        top: selectedWord.y0,       // Y Position
        fontSize: 20,              // Font Size (आप इसे Dynamic बना सकते हैं)
        fill: 'black',              // Text Color (आप इसे Dynamic बना सकते हैं)
    });
    
    fabricCanvas.add(text);         // Canvas पर Text Add करें
    document.getElementById('editBox').classList.add('hidden'); // Edit Box छुपाएँ
}
    }
});

// Click किए गए Word को ढूँढें
function findClickedWord(x, y) {
    // OCR से मिले Words में से Match करें
    for (const word of words) {
        if (x >= word.x0 && x <= word.x1 && y >= word.y0 && y <= word.y1) {
            return word; // Match हुआ Word Return करें
        }
    }
    return null; // कोई Word नहीं मिला तो null Return करें
}

// Edit Box दिखाएँ
function showEditBox(word) {
    const editBox = document.getElementById('editBox');
    editBox.style.left = `${word.x0}px`; // Edit Box की X Position
    editBox.style.top = `${word.y0}px`;  // Edit Box की Y Position
    editBox.classList.remove('hidden');  // Edit Box दिखाएँ
}
    };
});

// Step 2: OCR से Text डिटेक्ट करें
async function runOCR(image) {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    // OCR चलाएँ
    const { data: { words } } = await worker.recognize(image);
    console.log("Detected Text:", words);
    
    // हर Word का Bounding Box Canvas पर दिखाएँ
    words.forEach(word => {
        const { x0, y0, x1, y1 } = word.bbox;
        drawBox(x0, y0, x1 - x0, y1 - y0);
    });
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
    
    // Edit Box की Position सेट करें
    editBox.style.left = `${x}px`;
    editBox.style.top = `${y}px`;
    editBox.classList.remove('hidden');
});

// Step 5: Edit किया Text Save करें
function saveEdit() {
    // Download Button का Function
function exportPDF() {
    const editedImage = fabricCanvas.toDataURL('image/jpeg'); // Canvas को Image में Convert करें
    const pdf = new jsPDF();                                 // नया PDF बनाएँ
    pdf.addImage(editedImage, 'JPEG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height); // Image को PDF में Add करें
    pdf.save('edited-marksheet.pdf');                        // PDF Download करें
}
    const newText = editedText.value;
    
    // नया Text Canvas पर Add करें
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(newText, parseInt(editBox.style.left), parseInt(editBox.style.top));
    
    // Edit Box Hide करें
    editBox.classList.add('hidden');
}