import React, { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack"; // Import pdfjs with webpack
import pdfUrl from "./utils/invoice_8 1.pdf"; // Path to your PDF file

// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const CanvasPDFViewer = () => {
  const canvasRef = useRef(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPages, setPdfPages] = useState([]); // Store all the PDF pages
  const [renderingTasks, setRenderingTasks] = useState({}); // Track rendering tasks by page
  const [scale] = useState(2); // PDF scale factor
  const [selectedCoordinate, setSelectedCoordinate] = useState([
    {
      key: "PAN Number",
      text: "AAYCS6904J",
      page: 1,
      x: 102.0,
      y: 125.14999389648438,
      width: 43.909637451171875,
      height: 9.0,
    },
    {
      key: "CIN NO",
      text: "L25209GJ2017PLC097273",
      page: 1,
      x: 102.0,
      y: 137.19998168945312,
      width: 93.8265380859375,
      height: 9.0,
    },
    {
      key: "invoice_number",
      text: "232431451",
      page: 1,
      x: 110.03399658203125,
      y: 155.14999389648438,
      width: 41.0655517578125,
      height: 9.0,
    },
    {
      key: "invoice_date",
      text: "31/03/2024",
      page: 1,
      x: 252.0,
      y: 155.14999389648438,
      width: 44.242431640625,
      height: 9.0,
    },
    {
      key: "Party P.O. Ref",
      text: "AMAZON",
      page: 1,
      x: 108.0,
      y: 167.14999389648438,
      width: 33.99757385253906,
      height: 9.0,
    },
    {
      key: "product_1_name",
      text: "SHISH WATER TANK COVER 1000L",
      page: 1,
      x: 38.0,
      y: 404.08746337890625,
      width: 99.67637634277344,
      height: 7.350006103515625,
    },
    {
      key: "product_2_name",
      text: "GROW BAG 24 X 24 INCH",
      page: 1,
      x: 37.999969482421875,
      y: 420.08746337890625,
      width: 74.74249267578125,
      height: 7.350006103515625,
    },
    {
      key: "product_3_name",
      text: "GROW BAG 15 X 15 INCH",
      page: 1,
      x: 37.999969482421875,
      y: 436.08746337890625,
      width: 74.74249267578125,
      height: 7.350006103515625,
    },
    {
      key: "product_4_name",
      text: "GROW BAG 15 X 15 INCH",
      page: 1,
      x: 37.999969482421875,
      y: 452.08746337890625,
      width: 74.74249267578125,
      height: 7.350006103515625,
    },
  ]);
  const [selectedText, setSelectedText] = useState("");
  const [selection, setSelection] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isSelecting: false,
    pageIndex: 0,
  });
  const [hoverInfo, setHoverInfo] = useState({
    isVisible: false,
    x: 0,
    y: 0,
    key: "",
  });
  const [popup, setPopup] = useState({
    isVisible: false,
    x: 0,
    y: 0,
    selectedCoordIndex: null,
  });
  const [selectionOverlay, setSelectionOverlay] = useState(null); // For showing selection rectangle
  const [selectedHovered, setselectedHovered] = useState(null);

  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
        const fileUrl = URL.createObjectURL(file);
        console.log("fileUrl : ",fileUrl)
        setPdfFile(fileUrl)
    }
};

  useEffect(() => {
    const loadPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfFile);
      const pdf = await loadingTask.promise;
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        pages.push(page); // Push each page into the pages array
      }
      setPdfPages(pages); // Set all the pages into the state
    };
    if(pdfFile){
      loadPDF();
    }
  }, [pdfFile]);

  const renderPage = async (page, index) => {
    if (renderingTasks[index]) {
      renderingTasks[index].cancel();
    }

    const canvas = document.getElementById(`pdf-canvas-${index}`);
    const context = canvas.getContext("2d");
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderTask = page.render({
      canvasContext: context,
      viewport: viewport,
    });

    setRenderingTasks((prev) => ({ ...prev, [index]: renderTask }));

    try {
      await renderTask.promise;
      drawHighlights(context, viewport, index);
    } catch (error) {
      console.error("Render error:", error);
    } finally {
      setRenderingTasks((prev) => {
        const updatedTasks = { ...prev };
        delete updatedTasks[index];
        return updatedTasks;
      });
    }
  };

  const drawHighlights = (context, viewport, pageIndex) => {
    selectedCoordinate.forEach((coord, index) => {
      if (coord.page === pageIndex + 1) {
        const adjustedX = coord.x * viewport.scale;
        const adjustedY = coord.y * viewport.scale;
        const adjustedWidth = coord.width * viewport.scale;
        const adjustedHeight = coord.height * viewport.scale;

        context.strokeStyle = "rgba(255, 0, 0, 0.5)";
        context.lineWidth = 2;
        context.strokeRect(adjustedX, adjustedY, adjustedWidth, adjustedHeight);

        canvasRef.current.addEventListener("click", (event) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = event.clientX - rect.left; // Get the x-coordinate of the click
          const y = event.clientY - rect.top; // Get the y-coordinate of the click

          if (
            x >= adjustedX &&
            x <= adjustedX + adjustedWidth &&
            y >= adjustedY &&
            y <= adjustedY + adjustedHeight
          ) {
            handleHighlightClick(
              { x: adjustedX, y: adjustedY, height: adjustedHeight },
              index
            ); // Handle highlight click
          }
        });
        // Mousemove event listener for hover
        canvasRef.current.addEventListener("mousemove", (event) => {
          const rect = canvasRef.current.getBoundingClientRect();
          const mouseX = event.clientX - rect.left; // Get the x-coordinate of the mouse
          const mouseY = event.clientY - rect.top; // Get the y-coordinate of the mouse

          if (
            mouseX >= adjustedX &&
            mouseX <= adjustedX + adjustedWidth &&
            mouseY >= adjustedY &&
            mouseY <= adjustedY + adjustedHeight
          ) {
            handleHover(
              { x: adjustedX, y: adjustedY, height: adjustedHeight },
              index
            );
          }
        });
      }
    });
  };

  useEffect(() => {
    if (pdfPages.length) {
      pdfPages.forEach((page, index) => {
        renderPage(page, index);
      });
    }
  }, [pdfPages, selectedCoordinate]);

  const handleMouseDown = (e, pageIndex) => {
    const canvas = document.getElementById(`pdf-canvas-${pageIndex}`);
    const rect = canvas.getBoundingClientRect();

    setSelection({
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      endX: e.clientX - rect.left,
      endY: e.clientY - rect.top,
      isSelecting: true,
      pageIndex,
    });
  };

  const handleMouseMove = (e) => {
    // handleHighlightHover(e);
    const canvas1 = e.target;
    canvas1.style.cursor = "crosshair";

    if (!selection.isSelecting) {
      // checkHover(e);
      return;
    }

    const canvas = document.getElementById(`pdf-canvas-${selection.pageIndex}`);
    const rect = canvas.getBoundingClientRect();

    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;

    setSelection((prev) => ({
      ...prev,
      endX,
      endY,
    }));

    setSelectionOverlay({
      left: Math.min(selection.startX, endX),
      top: Math.min(selection.startY, endY),
      width: Math.abs(endX - selection.startX),
      height: Math.abs(endY - selection.startY),
    });
  };

  const handleMouseUp = async () => {
    if (!selection.isSelecting) return;

    const text = await extractSelectedText(selection.pageIndex);
    if (text) {
      const scaledSelection = {
        text,
        key: text,
        page: selection.pageIndex + 1,
        x: Math.min(selection.startX, selection.endX) / scale,
        y: Math.min(selection.startY, selection.endY) / scale,
        width: Math.abs(selection.endX - selection.startX) / scale,
        height: Math.abs(selection.endY - selection.startY) / scale,
      };

      setSelectedCoordinate((prev) => [...prev, scaledSelection]);
      setSelectedText(text);
    }
    setSelection({ ...selection, isSelecting: false });
    setSelectionOverlay(null);
  };

  const extractSelectedText = async (pageIndex) => {
    const page = pdfPages[pageIndex];
    const { startX, startY, endX, endY } = selection;
    const textContent = await page.getTextContent();
    const textItems = textContent.items;

    let selectedText = "";

    const canvasHeight = document.getElementById(
      `pdf-canvas-${pageIndex}`
    ).height;
    const adjustedStartX = Math.min(startX, endX) / scale;
    const adjustedEndX = Math.max(startX, endX) / scale;
    const adjustedStartY = (canvasHeight - Math.max(startY, endY)) / scale; // Flip Y
    const adjustedEndY = (canvasHeight - Math.min(startY, endY)) / scale; // Flip Y

    textItems.forEach((item) => {
      const { transform, str } = item;
      const x = transform[4];
      const y = transform[5];

      if (
        x >= adjustedStartX &&
        x <= adjustedEndX &&
        y >= adjustedStartY &&
        y <= adjustedEndY
      ) {
        selectedText += str + " ";
      }
    });

    return selectedText.trim();
  };

  const handleHighlightClick = (coord, index) => {
    setPopup({
      isVisible: true,
      x: coord.x,
      y: coord.y,
      height: coord.height,
      selectedCoordIndex: index,
    }); // Show popup on highlight click
  };
  const handleHover = (coord, index) => {
    setselectedHovered({
      isVisible: true,
      x: coord.x,
      y: coord.y,
      height: coord.height,
      selectedCoordIndex: index,
    });
  };

  const handleDeleteHighlight = () => {
    if (popup.selectedCoordIndex !== null) {
      setSelectedCoordinate(
        (prev) => prev.filter((_, i) => i !== popup.selectedCoordIndex) // Remove highlight based on index
      );
      setPopup({ isVisible: false, x: 0, y: 0, selectedCoordIndex: null }); // Hide popup
    }
  };

  const handleOnKeyHove = (coord, index) => {
    const adjustedX = coord.x * scale;
    const adjustedY = coord.y * scale;
    const adjustedHeight = coord.height * scale;
    handleHover({ x: adjustedX, y: adjustedY, height: adjustedHeight }, index);
  };

  return (
    <>
    <input type="file" onChange={handlePdfUpload} accept="application/pdf" />
    {pdfFile && 
    <div style={{ display: "flex" }}>
      <div>
        {pdfPages.map((page, index) => (
          <div
            key={index}
            style={{
              position: "relative",
            }}
          >
            <canvas
              id={`pdf-canvas-${index}`}
              ref={index === 0 ? canvasRef : null}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            ></canvas>

            {selectionOverlay &&
              selection.isSelecting &&
              selection.pageIndex === index && (
                <div
                  style={{
                    position: "absolute",
                    left: selectionOverlay.left,
                    top: selectionOverlay.top,
                    width: selectionOverlay.width,
                    height: selectionOverlay.height,
                    border: "2px dashed gray",
                    pointerEvents: "none",
                    cursor: "move",
                    animation: "dash-animation 2s linear infinite", // Add animation here
                  }}
                ></div>
              )}
          </div>
        ))}

        {popup.isVisible && (
          <div
            style={{
              position: "absolute",
              left: popup.x,
              top: popup.y + popup.height,
              backgroundColor: "white",
              padding: "10px",
              border: "1px solid black",
              zIndex: 1000,
            }}
          >
            <div>Key: {selectedCoordinate[popup.selectedCoordIndex]?.key}</div>
            <div>
              Text: {selectedCoordinate[popup.selectedCoordIndex]?.text}
            </div>
            <button onClick={handleDeleteHighlight}>Delete Highlight</button>
          </div>
        )}
        {selectedHovered && selectedHovered?.isVisible && (
          <div
            style={{
              position: "absolute",
              left: selectedHovered.x,
              top: selectedHovered.y + selectedHovered.height,
              backgroundColor: "white",
              padding: "10px",
              border: "1px solid black",
              zIndex: 1000,
            }}
          >
            <div>
              {selectedCoordinate[selectedHovered.selectedCoordIndex]?.key}
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          width: "300px",
          marginLeft: "20px",
          paddingLeft: "10px",
          borderLeft: "1px solid black",
          position: "sticky",
          top: "0", // Sticks to the top of the viewport when scrolling
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <h3>Selected Key-Value Pairs</h3>
        <ul>
          {selectedCoordinate.map((coord, index) => (
            <li
              key={index}
              onMouseEnter={(e) => {
                handleOnKeyHove(coord, index);
              }}
              style={{ cursor: "pointer" }}
            >
              <strong>{coord.key}:</strong> {coord.text}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <input placeholder="Key" />
        <input placeholder="Value" />
      </div>
    </div>
    }
    </>
  );
};

export default CanvasPDFViewer;
