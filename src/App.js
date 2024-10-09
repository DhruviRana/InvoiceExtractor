import React, { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack"; // Import pdfjs with webpack
import pdfUrl from "./utils/invoice_8 1.pdf"; // Path to your PDF file

// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const CanvasPDFViewer = () => {
  const canvasRef = useRef(null);
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

  useEffect(() => {
    const loadPDF = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const pages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        pages.push(page); // Push each page into the pages array
      }
      setPdfPages(pages); // Set all the pages into the state
    };

    loadPDF();
  }, [selectedCoordinate]);

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
            handleHighlightClick({ x: adjustedX, y: adjustedY }, index); // Handle highlight click
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
    handleHighlightHover(e);
    const canvas1 = e.target;
    canvas1.style.cursor = "crosshair";

    if (!selection.isSelecting) {
      checkHover(e);
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

  const handleHighlightHover = (e) => {
    const canvasIndex = Math.floor(e.target.id.split("-")[2]);
    const canvas = document.getElementById(`pdf-canvas-${canvasIndex}`);
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    const hoveringOverHighlight = selectedCoordinate.some((coord) => {
      return (
        coord.page === canvasIndex + 1 &&
        mouseX >= coord.x &&
        mouseX <= coord.x + coord.width &&
        mouseY >= coord.y &&
        mouseY <= coord.y + coord.height
      );
    });

    if (hoveringOverHighlight) {
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "auto";
      resetHoverInfo(); // Reset hover info when leaving the highlight area
    }
  };

  const resetHoverInfo = () => {
    setHoverInfo({
      isVisible: false,
      x: 0,
      y: 0,
      key: "",
    });
  };

  const handleMouseUp = async () => {
    if (!selection.isSelecting) return;

    const text = await extractSelectedText(selection.pageIndex);
    console.log("text : ", text);
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

  const checkHover = (e) => {
    const canvasIndex = Math.floor(e.target.id.split("-")[2]);
    const canvas = document.getElementById(`pdf-canvas-${canvasIndex}`);
    const rect = canvas.getBoundingClientRect();

    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    selectedCoordinate.forEach((coord) => {
      if (coord.page === canvasIndex + 1) {
        if (
          mouseX >= coord.x &&
          mouseX <= coord.x + coord.width &&
          mouseY >= coord.y &&
          mouseY <= coord.y + coord.height
        ) {
          setHoverInfo({
            isVisible: true,
            x: e.clientX,
            y: e.clientY,
            key: coord.key,
          });
        }
      }
    });
  };

  // const handleHighlightHover = (e) => {
  //   const canvasIndex = Math.floor(e.target.id.split("-")[2]);
  //   const canvas = document.getElementById(`pdf-canvas-${canvasIndex}`);
  //   const rect = canvas.getBoundingClientRect();
  //   const mouseX = (e.clientX - rect.left) / scale;
  //   const mouseY = (e.clientY - rect.top) / scale;

  //   const hoveringOverHighlight = selectedCoordinate.some((coord) => {
  //     return (
  //       coord.page === canvasIndex + 1 &&
  //       mouseX >= coord.x &&
  //       mouseX <= coord.x + coord.width &&
  //       mouseY >= coord.y &&
  //       mouseY <= coord.y + coord.height
  //     );
  //   });

  //   if (hoveringOverHighlight) {
  //     canvas.style.cursor = "pointer";
  //   } else {
  //     canvas.style.cursor = "auto";
  //   }
  // };

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
      selectedCoordIndex: index,
    }); // Show popup on highlight click
  };

  const handleDeleteHighlight = () => {
    if (popup.selectedCoordIndex !== null) {
      setSelectedCoordinate(
        (prev) => prev.filter((_, i) => i !== popup.selectedCoordIndex) // Remove highlight based on index
      );
      setPopup({ isVisible: false, x: 0, y: 0, selectedCoordIndex: null }); // Hide popup
    }
  };

  return (
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
                  border: "2px dashed red",
                  pointerEvents: "none",
                }}
              ></div>
            )}
        </div>
      ))}

      {hoverInfo.isVisible && (
        <div
          style={{
            position: "absolute",
            left: hoverInfo.x, // Adjust X position with scroll offset
            top: hoverInfo.y, // Adjust Y position with scroll offset
            padding: "5px",
            backgroundColor: "white",
            border: "1px solid black",
            borderRadius: "3px",
            pointerEvents: "none", // Ensures no interaction with this hover info
          }}
        >
          {hoverInfo.key}
        </div>
      )}

      {popup.isVisible && (
        <div
          style={{
            position: "absolute",
            left: popup.x + 10,
            top: popup.y + 10,
            backgroundColor: "white",
            padding: "10px",
            border: "1px solid black",
            zIndex: 1000,
          }}
        >
          <div>Key: {selectedCoordinate[popup.selectedCoordIndex]?.key}</div>
          <div>Text: {selectedCoordinate[popup.selectedCoordIndex]?.text}</div>
          <button onClick={handleDeleteHighlight}>Delete Highlight</button>
        </div>
      )}
    </div>
  );
};

export default CanvasPDFViewer;

// import React, { useEffect, useState, useRef } from "react";
// import * as pdfjsLib from "pdfjs-dist/webpack"; // Import pdfjs with webpack
// import pdfUrl from "./utils/invoice_8 1.pdf"; // Path to your PDF file

// // Set the PDF.js worker source
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

// const CanvasPDFViewer = () => {
//   const canvasRef = useRef(null);
//   const [pdfPages, setPdfPages] = useState([]); // Store all the PDF pages
//   const [renderingTasks, setRenderingTasks] = useState({}); // Track rendering tasks by page
//   const [scale] = useState(2); // PDF scale factor
//   const [selectedCoordinate, setSelectedCoordinate] = useState([
//     {
//       key: "PAN Number",
//       text: "AAYCS6904J",
//       page: 1,
//       x: 102.0,
//       y: 125.14999389648438,
//       width: 43.909637451171875,
//       height: 9.0,
//     },
//     {
//       key: "PAN Number",
//       text: "AAYCS6904J",
//       page: 1,
//       x: 111.12600708007812,
//       y: 113.14998626708984,
//       width: 44.73951721191406,
//       height: 9.0,
//     },
//     {
//       key: "CIN NO",
//       text: "L25209GJ2017PLC097273",
//       page: 1,
//       x: 102.0,
//       y: 137.19998168945312,
//       width: 93.8265380859375,
//       height: 9.0,
//     },
//     {
//       key: "invoice_number",
//       text: "232431451",
//       page: 1,
//       x: 110.03399658203125,
//       y: 155.14999389648438,
//       width: 41.0655517578125,
//       height: 9.0,
//     },
//     {
//       key: "invoice_date",
//       text: "31/03/2024",
//       page: 1,
//       x: 252.0,
//       y: 155.14999389648438,
//       width: 44.242431640625,
//       height: 9.0,
//     },
//     {
//       key: "invoice_date",
//       text: "31/03/2024",
//       page: 1,
//       x: 432.0,
//       y: 167.14999389648438,
//       width: 43.450439453125,
//       height: 9.0,
//     },
//     {
//       key: "Party P.O. Ref",
//       text: "AMAZON",
//       page: 1,
//       x: 108.0,
//       y: 167.14999389648438,
//       width: 33.99757385253906,
//       height: 9.0,
//     },
//     {
//       key: "Party P.O. Ref",
//       text: "AMAZON",
//       page: 1,
//       x: 24.0,
//       y: 198.64999389648438,
//       width: 30.308589935302734,
//       height: 9.0,
//     },
//     {
//       key: "Party P.O. Ref",
//       text: "AMAZON",
//       page: 1,
//       x: 312.0,
//       y: 198.64999389648438,
//       width: 30.30859375,
//       height: 9.0,
//     },
//     {
//       key: "Date",
//       text: "31/03/2024",
//       page: 1,
//       x: 252.0,
//       y: 155.14999389648438,
//       width: 44.242431640625,
//       height: 9.0,
//     },
//     {
//       key: "Date",
//       text: "31/03/2024",
//       page: 1,
//       x: 432.0,
//       y: 167.14999389648438,
//       width: 43.450439453125,
//       height: 9.0,
//     },
//     {
//       key: "Date of Supply",
//       text: "31/03/2024",
//       page: 1,
//       x: 252.0,
//       y: 155.14999389648438,
//       width: 44.242431640625,
//       height: 9.0,
//     },
//     {
//       key: "Date of Supply",
//       text: "31/03/2024",
//       page: 1,
//       x: 432.0,
//       y: 167.14999389648438,
//       width: 43.450439453125,
//       height: 9.0,
//     },
//     {
//       key: "product_1_name",
//       text: "SHISH WATER TANK COVER 1000L",
//       page: 1,
//       x: 38.0,
//       y: 404.08746337890625,
//       width: 99.67637634277344,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_1_hsn_code",
//       text: "39202090",
//       page: 1,
//       x: 232.4499969482422,
//       y: 404.08746337890625,
//       width: 29.810440063476562,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_1_hsn_code",
//       text: "39202090",
//       page: 1,
//       x: 232.4500274658203,
//       y: 468.08746337890625,
//       width: 29.810440063476562,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_2_name",
//       text: "GROW BAG 24 X 24 INCH",
//       page: 1,
//       x: 37.999969482421875,
//       y: 420.08746337890625,
//       width: 74.74249267578125,
//       height: 7.350006103515625,
//     },
//     {
//       y: 436.08746337890625,
//       width: 29.810440063476562,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_2_hsn_code",
//       text: "39269099",
//       page: 1,
//       x: 232.44998168945312,
//       y: 452.08746337890625,
//       width: 29.8104248046875,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_3_name",
//       text: "GROW BAG 15 X 15 INCH",
//       page: 1,
//       x: 37.999969482421875,
//       y: 436.08746337890625,
//       width: 74.74249267578125,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_3_name",
//       text: "GROW BAG 15 X 15 INCH",
//       page: 1,
//       x: 37.99998474121094,
//       y: 452.08746337890625,
//       width: 74.74249267578125,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_3_hsn_code",
//       text: "39269099",
//       page: 1,
//       x: 232.44996643066406,
//       y: 420.08746337890625,
//       width: 29.810440063476562,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_3_hsn_code",
//       text: "39269099",
//       page: 1,
//       x: 232.44996643066406,
//       y: 436.08746337890625,
//       width: 29.810440063476562,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_3_hsn_code",
//       text: "39269099",
//       page: 1,
//       x: 232.44998168945312,
//       y: 452.08746337890625,
//       width: 29.8104248046875,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_4_name",
//       text: "GROW BAG 15 X 15 INCH",
//       page: 1,
//       x: 37.999969482421875,
//       y: 436.08746337890625,
//       width: 74.74249267578125,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_4_name",
//       text: "GROW BAG 15 X 15 INCH",
//       page: 1,
//       x: 37.99998474121094,
//       y: 452.08746337890625,
//       width: 74.74249267578125,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_4_hsn_code",
//       text: "39269099",
//       page: 1,
//       x: 232.44996643066406,
//       y: 420.08746337890625,
//       width: 29.810440063476562,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_4_hsn_code",
//       text: "39269099",
//       page: 1,
//       x: 232.44996643066406,
//       y: 436.08746337890625,
//       width: 29.810440063476562,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_4_hsn_code",
//       text: "39269099",
//       page: 1,
//       x: 232.44998168945312,
//       y: 452.08746337890625,
//       width: 29.8104248046875,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_5_hsn_code",
//       text: "39202090",
//       page: 1,
//       x: 232.4499969482422,
//       y: 404.08746337890625,
//       width: 29.810440063476562,
//       height: 7.350006103515625,
//     },
//     {
//       key: "product_5_hsn_code",
//       text: "39202090",
//       page: 1,
//       x: 232.4500274658203,
//       y: 468.08746337890625,
//       width: 29.810440063476562,
//       height: 7.350006103515625,
//     },
//   ]);
//   const [selectedText, setSelectedText] = useState("");
//   const [selection, setSelection] = useState({
//     startX: 0,
//     startY: 0,
//     endX: 0,
//     endY: 0,
//     isSelecting: false,
//     pageIndex: 0,
//   });
//   const [hoverInfo, setHoverInfo] = useState({
//     isVisible: false,
//     x: 0,
//     y: 0,
//     key: "",
//   });
//   const [selectionOverlay, setSelectionOverlay] = useState(null); // For showing selection rectangle

//   useEffect(() => {
//     const loadPDF = async () => {
//       const loadingTask = pdfjsLib.getDocument(pdfUrl);
//       const pdf = await loadingTask.promise;
//       const pages = [];
//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         pages.push(page); // Push each page into the pages array
//       }
//       setPdfPages(pages); // Set all the pages into the state
//     };

//     loadPDF();
//   }, []);

//   const renderPage = async (page, index) => {
//     if (renderingTasks[index]) {
//       // If there is already a rendering task in progress for this page, cancel it.
//       renderingTasks[index].cancel();
//     }

//     const canvas = document.getElementById(`pdf-canvas-${index}`);
//     const context = canvas.getContext("2d");
//     const viewport = page.getViewport({ scale });

//     // Set canvas dimensions based on the scaled viewport
//     canvas.width = viewport.width;
//     canvas.height = viewport.height;

//     // Create a render task and track it
//     const renderTask = page.render({
//       canvasContext: context,
//       viewport: viewport,
//     });

//     // Set the render task to the state so we can cancel it if needed
//     setRenderingTasks((prev) => ({ ...prev, [index]: renderTask }));

//     try {
//       await renderTask.promise; // Wait for the render to complete
//       drawHighlights(context, viewport, index);
//     } catch (error) {
//       console.error("Render error:", error);
//     } finally {
//       setRenderingTasks((prev) => {
//         const updatedTasks = { ...prev };
//         delete updatedTasks[index]; // Remove completed task
//         return updatedTasks;
//       });
//     }
//   };

//   const drawHighlights = (context, viewport, pageIndex) => {
//     selectedCoordinate.forEach((coord) => {
//       if (coord.page === pageIndex + 1) {
//         const adjustedX = coord.x * viewport.scale;
//         const adjustedY = coord.y * viewport.scale;
//         const adjustedWidth = coord.width * viewport.scale;
//         const adjustedHeight = coord.height * viewport.scale;

//         context.strokeStyle = "rgba(255, 0, 0, 0.5)";
//         context.lineWidth = 2;
//         context.strokeRect(adjustedX, adjustedY, adjustedWidth, adjustedHeight); // Draw highlight
//       }
//     });
//   };

//   useEffect(() => {
//     if (pdfPages.length) {
//       pdfPages.forEach((page, index) => {
//         renderPage(page, index);
//       });
//     }
//   }, [pdfPages, selectedCoordinate]); // Re-render if selectedCoordinate changes

//   const handleMouseDown = (e, pageIndex) => {
//     const canvas = document.getElementById(`pdf-canvas-${pageIndex}`);
//     const rect = canvas.getBoundingClientRect();

//     setSelection({
//       startX: e.clientX - rect.left,
//       startY: e.clientY - rect.top,
//       endX: e.clientX - rect.left,
//       endY: e.clientY - rect.top,
//       isSelecting: true,
//       pageIndex,
//     });
//   };

//   const handleMouseMove = (e) => {
//     handleHighlightHover(e);
//     const canvas1 = e.target;
//     canvas1.style.cursor = "crosshair";
//     if (!selection.isSelecting) {
//       checkHover(e);
//     }
//     const canvas = document.getElementById(`pdf-canvas-${selection.pageIndex}`);
//     const rect = canvas.getBoundingClientRect();

//     const endX = e.clientX - rect.left;
//     const endY = e.clientY - rect.top;

//     // Update selection state
//     setSelection((prev) => ({
//       ...prev,
//       endX,
//       endY,
//     }));

//     // Update selection overlay for visual feedback
//     setSelectionOverlay({
//       left: Math.min(selection.startX, endX),
//       top: Math.min(selection.startY, endY),
//       width: Math.abs(endX - selection.startX),
//       height: Math.abs(endY - selection.startY),
//     });
//   };

//   const handleMouseUp = async () => {
//     if (!selection.isSelecting) return;

//     const text = await extractSelectedText(selection.pageIndex);
//     if (text) {
//       const scaledSelection = {
//         text,
//         key: text,
//         page: selection.pageIndex + 1,
//         x: Math.min(selection.startX, selection.endX) / scale,
//         y: Math.min(selection.startY, selection.endY) / scale,
//         width: Math.abs(selection.endX - selection.startX) / scale,
//         height: Math.abs(selection.endY - selection.startY) / scale,
//       };

//       setSelectedCoordinate((prev) => [...prev, scaledSelection]);
//       setSelectedText(text);
//     }
//     setSelection({ ...selection, isSelecting: false });
//     setSelectionOverlay(null); // Clear the visual feedback
//   };

//   const checkHover = (e) => {
//     const canvasIndex = Math.floor(e.target.id.split("-")[2]); // Extract page index from canvas ID
//     const canvas = document.getElementById(`pdf-canvas-${canvasIndex}`);
//     const rect = canvas.getBoundingClientRect();

//     const mouseX = (e.clientX - rect.left) / scale;
//     const mouseY = (e.clientY - rect.top) / scale;

//     selectedCoordinate.forEach((coord) => {
//       if (coord.page === canvasIndex + 1) {
//         console.log("in if");
//         const adjustedX = coord.x / scale; // Adjust X position based on scale
//         const adjustedY = coord.y / scale; // Adjust Y position based on scale
//         const adjustedWidth = coord.width / scale; // Adjust width based on scale
//         const adjustedHeight = coord.height / scale; // Adjust height based on scale

//         console.log("mouseX : ", mouseX);

//         console.log("adjustedX : ", adjustedX);

//         // Check if mouse is within the bounds of the highlighted area
//         if (
//           mouseX >= adjustedX &&
//           mouseX <= adjustedX + adjustedWidth &&
//           mouseY >= adjustedY &&
//           mouseY <= adjustedY + adjustedHeight
//         ) {
//           console.log("Hovered over highlight:", coord);
//         } else {
//           console.log("no found");
//         }
//       }
//     });
//   };

//   const extractSelectedText = async (pageIndex) => {
//     const page = pdfPages[pageIndex];
//     const { startX, startY, endX, endY } = selection;
//     const textContent = await page.getTextContent();
//     const textItems = textContent.items;

//     let selectedText = "";

//     const canvasHeight = document.getElementById(
//       `pdf-canvas-${pageIndex}`
//     ).height;
//     const adjustedStartX = Math.min(startX, endX) / scale;
//     const adjustedEndX = Math.max(startX, endX) / scale;
//     const adjustedStartY = (canvasHeight - Math.max(startY, endY)) / scale; // Flip Y
//     const adjustedEndY = (canvasHeight - Math.min(startY, endY)) / scale; // Flip Y

//     textItems.forEach((item) => {
//       const { transform, str } = item;
//       const x = transform[4];
//       const y = transform[5];

//       if (
//         x >= adjustedStartX &&
//         x <= adjustedEndX &&
//         y >= adjustedStartY &&
//         y <= adjustedEndY
//       ) {
//         selectedText += str + " ";
//       }
//     });

//     return selectedText.trim();
//   };

//   const handleHighlightHover = (e) => {
//     // console.log(e);
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const mouseX = e.clientX - rect.left; // Get mouse X coordinate
//     const mouseY = e.clientY - rect.top; // Get mouse Y coordinate

//     let isHovering = false;

//     selectedCoordinate.forEach((coord) => {
//       const adjustedX = coord.x; // Use original x-coordinate
//       const adjustedY = coord.y; // Use original y-coordinate
//       const adjustedWidth = coord.width; // Use original width
//       const adjustedHeight = coord.height; // Use original height

//       if (
//         mouseX >= adjustedX &&
//         mouseX <= adjustedX + adjustedWidth &&
//         mouseY >= adjustedY &&
//         mouseY <= adjustedY + adjustedHeight
//       ) {
//         isHovering = true;
//         setHoverInfo({
//           isVisible: true,
//           x: e.clientX,
//           y: e.clientY,
//           key: coord.key,
//         });
//       }
//     });

//     if (!isHovering) {
//       setHoverInfo({ isVisible: false, x: 0, y: 0, key: "" }); // Hide hover info if not hovering
//     }
//   };

//   return (
//     <div style={{ position: "relative" }}>
//       {pdfPages.map((_, index) => (
//         <div key={index} style={{ marginBottom: "20px", position: "relative" }}>
//           <canvas
//             ref={canvasRef}
//             id={`pdf-canvas-${index}`}
//             onMouseDown={(e) => handleMouseDown(e, index)}
//             onMouseMove={handleMouseMove}
//             onMouseUp={handleMouseUp}
//             style={{ border: "1px solid black", display: "block" }}
//           />
//           {selection.isSelecting &&
//             selection.pageIndex === index &&
//             selectionOverlay && (
//               <div
//                 style={{
//                   position: "absolute",
//                   left: selectionOverlay.left,
//                   top: selectionOverlay.top,
//                   width: selectionOverlay.width,
//                   height: selectionOverlay.height,
//                   border: "2px dashed rgba(0, 0, 255, 0.5)", // Blue dashed border for selection area
//                   pointerEvents: "none", // So it doesn't interfere with mouse events
//                 }}
//               />
//             )}
//         </div>
//       ))}
//       {hoverInfo.isVisible && (
//         <div
//           style={{
//             position: "absolute",
//             left: hoverInfo.x + 10,
//             top: hoverInfo.y + 10,
//             backgroundColor: "yellow",
//             padding: "5px",
//             border: "1px solid black",
//             zIndex: 1000,
//           }}
//         >
//           {hoverInfo.key}
//         </div>
//       )}
//       <div>
//         <strong>Selected Text:</strong> {selectedText}
//       </div>
//     </div>
//   );
// };

// // Example coordinates to pass to the component
// const App = () => {
//   return <CanvasPDFViewer />;
// };

// export default App;
