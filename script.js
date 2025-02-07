document.addEventListener("DOMContentLoaded", function () {
    const { jsPDF } = window.jspdf;
    function generateQuestions() {
        let minNumInput = document.getElementById("min-number");
        let maxNumInput = document.getElementById("max-number");
        let numQuestionsInput = document.getElementById("num-questions");
        let questionTypeInput = document.querySelector('input[name="question-type"]:checked');
        let directionInput = document.querySelector('input[name="question-orientation"]:checked');
    
        if (!minNumInput || !maxNumInput || !numQuestionsInput || !questionTypeInput || !directionInput) {
            console.error("One or more input elements are missing. Check your HTML IDs and names.");
            return [];
        }
    
        let minNum = parseInt(minNumInput.value);
        let maxNum = parseInt(maxNumInput.value);
        let numQuestions = parseInt(numQuestionsInput.value);
        let questionType = questionTypeInput.value;
        let direction = directionInput.value;
    
        let questionsSet = new Set();
        let questions = [];
        let attempts = 0;
        let maxAttempts = numQuestions * 5; // Prevent infinite loops
    
        while (questions.length < numQuestions && attempts < maxAttempts) {
            let num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            let num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            let operator = "+";
    
            if (questionType === "subtraction" || (questionType === "mixed" && Math.random() < 0.5)) {
                operator = "-";
                if (num1 < num2) [num1, num2] = [num2, num1]; // Prevents negative answers
            }
    
            let questionText = `${num1} ${operator} ${num2} = `;
    
            if (!questionsSet.has(questionText)) {
                questionsSet.add(questionText);
                questions.push({ num1, num2, operator, direction });
            }
    
            attempts++;
        }
    
        console.log("Final Generated Questions:", questions); // Debugging log
        return questions;
    }
    
    function previewWorksheet() {
        const previewContainer = document.getElementById("worksheet-preview");
    
        // Ensure the preview container exists
        if (!previewContainer) {
            console.error("Preview container not found!");
            return;
        }
    
        previewContainer.innerHTML = ""; // Clear previous content
        previewContainer.style.backgroundColor = "white";
        previewContainer.style.padding = "20px";
        previewContainer.style.display = "flex";
        previewContainer.style.flexDirection = "column";
        previewContainer.style.alignItems = "center";
    
        // Get title input and styling options
        const title = document.getElementById("title").value || "Math Worksheet";
        const titleColor = document.getElementById("titleColor").value;
        const fontStyle = document.getElementById("fontStyle").value;
        const titleFontSize = document.getElementById("titleFontSize").value + "px";
    
        // Create and style title element
        const titleElement = document.createElement("h2");
        titleElement.textContent = title;
        titleElement.style.color = titleColor;
        titleElement.style.fontSize = titleFontSize;
        titleElement.style.fontFamily = fontStyle;
        titleElement.style.textAlign = "center";
    
        previewContainer.appendChild(titleElement);
    
        // Generate Questions
        const questions = generateQuestions();
        console.log("Generated Questions:", questions); // Debugging log
        
        if (!questions || questions.length === 0) {
            console.error("No questions generated!");
            return;
        }
    
        // Create a grid container for questions
        const questionContainer = document.createElement("div");
        const numColumns = parseInt(document.getElementById("columns").value) || 2;
        const spacing = parseInt(document.getElementById("spacing").value) || 10;
    
        questionContainer.style.display = "grid";
        questionContainer.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
        questionContainer.style.gap = `${spacing}px`;
        questionContainer.style.width = "100%";
        questionContainer.style.maxWidth = "800px";
        questionContainer.style.marginTop = "10px";
        previewContainer.appendChild(questionContainer);
    
        // Populate the grid with questions
        questions.forEach(q => {
            const questionWrapper = document.createElement("div");
            questionWrapper.style.display = "flex";
            questionWrapper.style.justifyContent = "center";
            questionWrapper.style.alignItems = "center";
            questionWrapper.style.borderBottom = "1px dashed gray";
            questionWrapper.style.padding = "10px";
            questionWrapper.style.textAlign = "center";
            questionWrapper.style.height = "auto";
    
            if (q.direction === "horizontal") {
                const questionText = document.createElement("span");
                questionText.textContent = `${q.num1} ${q.operator} ${q.num2} = `;
                questionText.style.fontSize = "18px";
                questionText.style.fontWeight = "bold";
                questionWrapper.appendChild(questionText);
            } else {
                // Vertical layout with right alignment and no equal sign
                const verticalContainer = document.createElement("div");
                verticalContainer.style.display = "flex";
                verticalContainer.style.flexDirection = "column";
                verticalContainer.style.alignItems = "flex-end"; // Align right
                verticalContainer.style.fontSize = "20px";
                verticalContainer.style.fontWeight = "bold";
    
                const num1Element = document.createElement("div");
                num1Element.textContent = q.num1;
                
                const operatorElement = document.createElement("div");
                operatorElement.textContent = q.operator + " " + q.num2;
                
                const lineElement = document.createElement("div");
                lineElement.style.borderTop = "2px solid black";
                lineElement.style.width = "50px";
                lineElement.style.margin = "5px auto 0 auto";
    
                verticalContainer.appendChild(num1Element);
                verticalContainer.appendChild(operatorElement);
                verticalContainer.appendChild(lineElement);
                questionWrapper.appendChild(verticalContainer);
            }
    
            questionContainer.appendChild(questionWrapper);
        });
    }
    
    
    function downloadPDF() {
        let orientation = document.querySelector('input[name="orientation"]:checked').value;
        let doc = new jsPDF({
            orientation: orientation === "landscape" ? "l" : "p",
            unit: "in",
            format: "letter" // 8.5x11 inches
        });
    
        let title = document.getElementById("title").value || "Math Worksheet";
        let numColumns = parseInt(document.getElementById("columns").value) || 3; // Default to 3
        let spacing = parseFloat(document.getElementById("spacing").value) / 72 || 0.5; // Convert pixels to inches
        let questions = generateQuestions();
    
        let pageWidth = orientation === "landscape" ? 11 : 8.5;
        let pageHeight = orientation === "landscape" ? 8.5 : 11;
        let marginLeft = 0.5;
        let startY = 2; // Added extra gap for title
    
        // ** Header Section **
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Full Name: ____________________", marginLeft, 0.5);
        doc.text("Date: _______________", pageWidth - 3, 0.5);
    
        // ** Title Section **
        doc.setFontSize(16);
        doc.text(title, pageWidth / 2, 1.2, { align: "center" });
    
        // ** Questions Section **
                let columnWidth = (pageWidth - marginLeft * 2) / numColumns;
                let totalContentWidth = columnWidth * numColumns;
                let centeredMarginLeft = (pageWidth - totalContentWidth) / 2 + marginLeft; // Ensure full centering
                let yPosition = startY;
                let xPosition = centeredMarginLeft; // Start at centered position

    
        doc.setFontSize(14);
    
        questions.forEach((q, index) => {
            let questionText = `${q.num1} ${q.operator} ${q.num2} = `;
            
            if (q.direction === "horizontal") {
                doc.text(questionText, xPosition, yPosition);
            } else {
                // Vertical format, aligned to the right without equal sign
                let num1Width = doc.getTextWidth(`${q.num1}`);
                let num2Width = doc.getTextWidth(`${q.operator} ${q.num2}`);
                let maxWidth = Math.max(num1Width, num2Width);
                
                doc.text(`${q.num1}`, xPosition + maxWidth - num1Width, yPosition);
                doc.text(`${q.operator} ${q.num2}`, xPosition + maxWidth - num2Width, yPosition + 0.3);
                doc.setLineWidth(0.01);
                
    doc.line(xPosition, yPosition + 0.4, xPosition + maxWidth, yPosition + 0.4); // Line under numbers
            }
    
            xPosition += columnWidth; // Move to next column
    
            if ((index + 1) % numColumns === 0) {
                // Move to the next row
                xPosition = centeredMarginLeft;
                yPosition += spacing;
            }
    
            if (yPosition + spacing > pageHeight - 0.5) { 
                // If the content reaches the bottom, create a new page
                doc.addPage();
                yPosition = startY;
            }
        });
    
        doc.save("worksheet.pdf");
    }      
    
    function downloadImage() {
        const previewContainer = document.getElementById("worksheet-preview");
    
        if (!previewContainer) {
            console.error("Worksheet preview not found!");
            return;
        }
    
        // Ensure the preview is fully rendered before capturing
        setTimeout(() => {
            html2canvas(previewContainer, { scale: 2 }).then(canvas => {
                const link = document.createElement("a");
                link.href = canvas.toDataURL("image/png");
                link.download = "worksheet.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch(error => {
                console.error("Error capturing image:", error);
            });
        }, 500);
    }
    

    document.getElementById("preview-worksheet").addEventListener("click", previewWorksheet);
    document.getElementById("download-pdf").addEventListener("click", downloadPDF);
    document.getElementById("download-image").addEventListener("click", downloadImage);

});
