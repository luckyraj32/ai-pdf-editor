const canvas = document.getElementById('pdfCanvas');
const fileInput = document.getElementById('fileInput');
const editBox = document.getElementById('editBox');
const editedText = document.getElementById('editedText');

let selectedWord = null;
let words = [];
const fabricCanvas = new fabric.Canvas('pdfCanvas');

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) {
        console.error("No file selected!");
        return;
    }
    console.log("Uploaded File:", file);

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;

    img.onload = () => {
        console.log("Image loaded successfully!");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        runOCR(img);
    };

    img.onerror = () => {
        console.error("Failed to load image!");
    };
});

async function runOCR(image) {
    console.log("Running OCR...");
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    
    const { data: { words: detectedWords } } = await worker.recognize(image);
    console.log("Detected Words:", detectedWords);
    words = detectedWords;
    
    words.forEach(word => {
        const { x0, y0, x1, y1 } = word.bbox;
        drawBox(x0, y0, x1 - x0, y1 - y0);
    });
    
    await worker.terminate();
    console.log("OCR completed!");
}

function drawBox(x, y, width, height) {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    selectedWord = findClickedWord(x, y);
    if (selectedWord) {
        console.log("Selected Word:", selectedWord);
        showEditBox(selectedWord);
    }
});

function findClickedWord(x, y) {
    for (const word of words) {
        if (x >= word.x0 && x <= word.x1 && y >= word.y0 && y <= word.y1) {
            return word;
        }
    }
    return null;
}

function showEditBox(word) {
    editBox.style.left = `${word.x0}px`;
    editBox.style.top = `${word.y0}px`;
    editBox.classList.remove('hidden');
}

function saveEdit() {
    const newText = editedText.value;
    console.log("New Text:", newText);
    
    const text = new fabric.Text(newText, {
        left: selectedWord.x0,
        top: selectedWord.y0,
        fontSize: 20,
        fill: 'black',
    });
    
    fabricCanvas.add(text);
    editBox.classList.add('hidden');
    console.log("Text saved on canvas!");
}

function exportPDF() {
    const editedImage = fabricCanvas.toDataURL('image/jpeg');
    const pdf = new jsPDF();
    pdf.addImage(editedImage, 'JPEG', 0, 0, pdf.internal.pageSize.width, pdf.internal.pageSize.height);
    pdf.save('edited-marksheet.pdf');
}
