import React, { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack"; // Import pdfjs with webpack
import pdfUrl from "./utils/invoice_8 1.pdf"; // Path to your PDF file

// Set the PDF.js worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

const CanvasPDFViewer = () => {
  const canvasRef = useRef(null);
  const [pdfFile, setPdfFile] = useState(null);

  const [isHovered, setIsHovered] = useState(null);

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
      key: "PAN Number",
      text: "AAYCS6904J",
      page: 1,
      x: 111.12600708007812,
      y: 113.14998626708984,
      width: 44.73951721191406,
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
      key: "invoice_date",
      text: "31/03/2024",
      page: 1,
      x: 432.0,
      y: 167.14999389648438,
      width: 43.450439453125,
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
      key: "Party P.O. Ref",
      text: "AMAZON",
      page: 1,
      x: 24.0,
      y: 198.64999389648438,
      width: 30.308589935302734,
      height: 9.0,
    },
    {
      key: "Party P.O. Ref",
      text: "AMAZON",
      page: 1,
      x: 312.0,
      y: 198.64999389648438,
      width: 30.30859375,
      height: 9.0,
    },
    {
      key: "Date",
      text: "31/03/2024",
      page: 1,
      x: 252.0,
      y: 155.14999389648438,
      width: 44.242431640625,
      height: 9.0,
    },
    {
      key: "Date",
      text: "31/03/2024",
      page: 1,
      x: 432.0,
      y: 167.14999389648438,
      width: 43.450439453125,
      height: 9.0,
    },
    {
      key: "Date of Supply",
      text: "31/03/2024",
      page: 1,
      x: 252.0,
      y: 155.14999389648438,
      width: 44.242431640625,
      height: 9.0,
    },
    {
      key: "Date of Supply",
      text: "31/03/2024",
      page: 1,
      x: 432.0,
      y: 167.14999389648438,
      width: 43.450439453125,
      height: 9.0,
    },
    {
      key: "table_1_product_name",
      text: "SHISH WATER TANK COVER 1000L",
      page: 1,
      x: 38.0,
      y: 404.08746337890625,
      width: 99.67637634277344,
      height: 7.350006103515625,
    },
    {
      key: "table_1_product_code",
      text: "FGWC0001",
      page: 1,
      x: 186.74998474121094,
      y: 404.83746337890625,
      width: 33.16937255859375,
      height: 7.350006103515625,
    },
    {
      key: "table_1_hsn_code",
      text: "39202090",
      page: 1,
      x: 232.4499969482422,
      y: 404.08746337890625,
      width: 29.810440063476562,
      height: 7.350006103515625,
    },
    {
      key: "table_1_hsn_code",
      text: "39202090",
      page: 1,
      x: 232.4500274658203,
      y: 468.08746337890625,
      width: 29.810440063476562,
      height: 7.350006103515625,
    },
    {
      key: "table_1_qty",
      text: "1.000",
      page: 1,
      x: 282.06109619140625,
      y: 404.08746337890625,
      width: 16.75677490234375,
      height: 7.350006103515625,
    },
    {
      key: "table_1_uom",
      text: "NOS",
      page: 1,
      x: 318.5,
      y: 404.08746337890625,
      width: 12.990936279296875,
      height: 7.350006103515625,
    },
    {
      key: "table_1_uom",
      text: "NOS",
      page: 1,
      x: 318.4999694824219,
      y: 420.08746337890625,
      width: 12.990936279296875,
      height: 7.350006103515625,
    },
    {
      key: "table_1_uom",
      text: "NOS",
      page: 1,
      x: 318.4999694824219,
      y: 436.08746337890625,
      width: 12.990936279296875,
      height: 7.350006103515625,
    },
    {
      key: "table_1_uom",
      text: "NOS",
      page: 1,
      x: 318.5,
      y: 452.08746337890625,
      width: 12.990936279296875,
      height: 7.350006103515625,
    },
    {
      key: "table_1_discount",
      text: "0.00",
      page: 1,
      x: 449.5111083984375,
      y: 404.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_1_discount",
      text: "0.00",
      page: 1,
      x: 449.5110778808594,
      y: 420.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_1_discount",
      text: "0.00",
      page: 1,
      x: 449.5110778808594,
      y: 436.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_1_discount",
      text: "0.00",
      page: 1,
      x: 283.9375305175781,
      y: 452.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_1_discount",
      text: "0.00",
      page: 1,
      x: 449.5110778808594,
      y: 452.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_1_discount",
      text: "0.00",
      page: 1,
      x: 449.5111389160156,
      y: 468.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_1_discount",
      text: "0.00",
      page: 1,
      x: 449.961181640625,
      y: 490.83746337890625,
      width: 13.140594482421875,
      height: 7.350006103515625,
    },
    {
      key: "table_2_product_name",
      text: "GROW BAG 24 X 24 INCH",
      page: 1,
      x: 37.999969482421875,
      y: 420.08746337890625,
      width: 74.74249267578125,
      height: 7.350006103515625,
    },
    {
      key: "table_2_hsn_code",
      text: "39269099",
      page: 1,
      x: 232.44996643066406,
      y: 420.08746337890625,
      width: 29.810440063476562,
      height: 7.350006103515625,
    },
    {
      key: "table_2_hsn_code",
      text: "39269099",
      page: 1,
      x: 232.44996643066406,
      y: 436.08746337890625,
      width: 29.810440063476562,
      height: 7.350006103515625,
    },
    {
      key: "table_2_hsn_code",
      text: "39269099",
      page: 1,
      x: 232.44998168945312,
      y: 452.08746337890625,
      width: 29.8104248046875,
      height: 7.350006103515625,
    },
    {
      key: "table_2_qty",
      text: "5.000",
      page: 1,
      x: 282.0610656738281,
      y: 420.08746337890625,
      width: 16.75677490234375,
      height: 7.350006103515625,
    },
    {
      key: "table_2_qty",
      text: "5.000",
      page: 1,
      x: 282.0610656738281,
      y: 436.08746337890625,
      width: 16.75677490234375,
      height: 7.350006103515625,
    },
    {
      key: "table_2_uom",
      text: "NOS",
      page: 1,
      x: 318.5,
      y: 404.08746337890625,
      width: 12.990936279296875,
      height: 7.350006103515625,
    },
    {
      key: "table_2_uom",
      text: "NOS",
      page: 1,
      x: 318.4999694824219,
      y: 420.08746337890625,
      width: 12.990936279296875,
      height: 7.350006103515625,
    },
    {
      key: "table_2_uom",
      text: "NOS",
      page: 1,
      x: 318.4999694824219,
      y: 436.08746337890625,
      width: 12.990936279296875,
      height: 7.350006103515625,
    },
    {
      key: "table_2_uom",
      text: "NOS",
      page: 1,
      x: 318.5,
      y: 452.08746337890625,
      width: 12.990936279296875,
      height: 7.350006103515625,
    },
    {
      key: "table_2_rate",
      text: "152.37",
      page: 1,
      x: 349.0110778808594,
      y: 420.08746337890625,
      width: 20.48321533203125,
      height: 7.350006103515625,
    },
    {
      key: "table_2_amount",
      text: "761.85",
      page: 1,
      x: 403.2276916503906,
      y: 420.08746337890625,
      width: 20.48321533203125,
      height: 7.350006103515625,
    },
    {
      key: "table_2_amount",
      text: "761.85",
      page: 1,
      x: 498.9776916503906,
      y: 420.08746337890625,
      width: 20.483184814453125,
      height: 7.350006103515625,
    },
    {
      key: "table_2_discount",
      text: "0.00",
      page: 1,
      x: 449.5111083984375,
      y: 404.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_2_discount",
      text: "0.00",
      page: 1,
      x: 449.5110778808594,
      y: 420.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_2_discount",
      text: "0.00",
      page: 1,
      x: 449.5110778808594,
      y: 436.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_2_discount",
      text: "0.00",
      page: 1,
      x: 283.9375305175781,
      y: 452.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_2_discount",
      text: "0.00",
      page: 1,
      x: 449.5110778808594,
      y: 452.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_2_discount",
      text: "0.00",
      page: 1,
      x: 449.5111389160156,
      y: 468.08746337890625,
      width: 13.03033447265625,
      height: 7.350006103515625,
    },
    {
      key: "table_2_discount",
      text: "0.00",
      page: 1,
      x: 449.961181640625,
      y: 490.83746337890625,
      width: 13.140594482421875,
      height: 7.350006103515625,
    },
    {
      key: "table_2_taxable_value",
      text: "761.85",
      page: 1,
      x: 403.2276916503906,
      y: 420.08746337890625,
      width: 20.48321533203125,
      height: 7.350006103515625,
    },
    {
      key: "table_2_taxable_value",
      text: "761.85",
      page: 1,
      x: 498.9776916503906,
      y: 420.08746337890625,
      width: 20.483184814453125,
      height: 7.350006103515625,
    },
    {
      key: "table_2_value",
      text: "898.98",
      page: 1,
      x: 558.427490234375,
      y: 420.08746337890625,
      width: 20.483154296875,
      height: 7.350006103515625,
    },
  ]);
  const [selectedText, setSelectedText] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [selection, setSelection] = useState({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isSelecting: false,
    pageIndex: 0,
  });
  const [popup, setPopup] = useState({
    isVisible: false,
    x: 0,
    y: 0,
    selectedCoordIndex: null,
  });
  const [selectionOverlay, setSelectionOverlay] = useState(null); // For showing selection rectangle
  const [selectedHovered, setselectedHovered] = useState(null);
  const [rowData, setRowData] = useState({ isVisible: false });
  const [hoveredIndex, setHoveredIndex] = useState(null); // New state to track hovered index

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
    if (pdfFile) {
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
        if (coord.isConfirm != "P") {
          context.strokeStyle =
            hoveredIndex === index
              ? "rgba(0, 0, 255, 0.5)"
              : "rgba(255, 0, 0, 0.5)";
        }
        if (coord.isConfirm == "Y") {
          context.strokeStyle = "rgba(0, 255, 0, 0.5)";
        }
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
  }, [pdfPages, selectedCoordinate, hoveredIndex]);

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
        isConfirm: "P",
      };

      setSelectedText(text.trim());
      // const splitedArr = text.split(":");
      // console.log(splitedArr);
      // if (splitedArr.length > 1) {
      //   // setSelectedKey(splitedArr[0]);
      //   setSelectedText(splitedArr[1].trim());
      // } else {
      //   // setSelectedKey("");
      //   setSelectedText(text.trim());
      // }

      setRowData({
        isVisible: true,
        page: selection.pageIndex + 1,
        x: Math.min(selection.startX, selection.endX),
        y: Math.min(selection.startY, selection.endY),
        height: Math.abs(selection.endY - selection.startY),
        width: Math.abs(selection.endX - selection.startX),
        index: selectedCoordinate.length,
      });

      setSelectedCoordinate((prev) => [...prev, scaledSelection]);
      // setSelectedText(text);
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
    setHoveredIndex(index);
    setselectedHovered({
      isVisible: true,
      x: coord.x,
      y: coord.y,
      height: coord.height,
      selectedCoordIndex: index,
    });
  };
  const handleHoverLeave = () => {
    setIsHovered(null);
    setHoveredIndex(null);
    setselectedHovered(null);
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
    setIsHovered(index);
    const adjustedX = coord.x * scale;
    const adjustedY = coord.y * scale;
    const adjustedHeight = coord.height * scale;
    handleHover({ x: adjustedX, y: adjustedY, height: adjustedHeight }, index);
  };

  const handleChange = (selected) => {
    const value = selected.target.value;
    setSelectedKey(value);
  };

  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
    }
  };

  const handleDeletebutton = (selectedCoordIndex) => {
    setSelectedCoordinate((prev) =>
      prev.map((coord, i) => {
        if (i === selectedCoordIndex) {
          return {
            ...coord,
            text: "",
            x: 0,
            y: 0,
            page: coord.page,
            width: 0,
            height: 0,
            isConfirm: "N",
          };
        }
        return coord;
      })
    );

    // setSelectedCoordinate(
    //   (prev) => prev.filter((_, i) => i !== selectedCoordIndex)
    // );
  };

  return (
    <>
      {pdfFile && (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 50%", backgroundColor: "#f0f0f0" }}>
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
                <div>
                  Key: {selectedCoordinate[popup.selectedCoordIndex]?.key}
                </div>
                <div>
                  Text: {selectedCoordinate[popup.selectedCoordIndex]?.text}
                </div>
                <button onClick={handleDeleteHighlight}>
                  Delete Highlight
                </button>
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
              flex: "0 0 30%",
              marginLeft: "20px",
              paddingLeft: "10px",
              borderLeft: "1px solid black",
              position: "sticky",
              top: "0",
              height: "100vh",
              overflowY: "auto",
            }}
          >
            <h3>Selected Key-Value Pairs</h3>
            {selectedCoordinate.map((coord, index) => {
              // State to manage hover effect for each row

              return (
                <>
                  {coord.isConfirm !== "P" && (
                    <>
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexDirection: "row",
                          gap: "20px",
                          padding: "10px 0",
                          borderBottom: "1px solid #ddd",
                          cursor: "pointer",
                          position: "relative", // Add relative position for hover effect
                        }}
                        onMouseEnter={() => handleOnKeyHove(coord, index)} // Set hover state
                        onMouseLeave={() => handleHoverLeave()} // Reset hover state
                      >
                        {/* Left align key */}
                        <div
                          style={{
                            width: "200px",
                            fontWeight: "bold",
                            textAlign: "left",
                          }}
                        >
                          {coord.key}
                        </div>

                        {/* Left align value */}
                        <div
                          style={{
                            textAlign: "left",
                            width: "200px",
                          }}
                        >
                          {coord.text}
                        </div>

                        <div>
                          {coord.text && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "end",
                                gap: "10px",
                                textAlign: "center",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "20px",
                                  opacity: isHovered === index ? 1 : 0,
                                  transition: "opacity 0.3s ease",
                                }}
                                onClick={(e) => {
                                  console.log(coord, index);
                                  const updatedCoordinates =
                                    selectedCoordinate.map((coordinate, i) => {
                                      if (i == index) {
                                        return {
                                          ...coordinate,
                                          isConfirm: "Y",
                                        };
                                      }
                                      return coordinate;
                                    });

                                  setSelectedCoordinate(updatedCoordinates);
                                  setRowData({ isVisible: false });
                                }}
                              >
                                &#x2713;
                              </div>
                              <div
                                style={{
                                  fontSize: "25px",
                                  opacity: isHovered === index ? 1 : 0,
                                  transition: "opacity 0.3s ease",
                                }}
                                onClick={() => {
                                  handleDeletebutton(index);
                                }}
                              >
                                &#x10102;
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              );
            })}
          </div>

          {rowData && rowData.isVisible && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: rowData.x,
                  top: rowData.y + rowData.height,
                  backgroundColor: "red",
                  padding: "10px",
                  border: "1px solid black",
                  zIndex: 1000,
                }}
              >
                <div>
                  <select
                    id="dropdown"
                    value={selectedKey}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select a key
                    </option>
                    {selectedCoordinate.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.key}
                      </option>
                    ))}
                  </select>
                </div>
                <input placeholder="Value" value={selectedText} />
                <div>
                  <button
                    value={"Confirm"}
                    onClick={() => {
                      console.log("selectedKey : ", selectedKey);
                      if (!selectedKey) {
                        return alert("Please select key");
                      }
                      if (!selectedText) {
                        return alert("Value can not be blank");
                      }
                      const updatedCoordinates = selectedCoordinate
                        .filter((_, i) => i !== rowData.index) // Filter out the element where i equals rowData.index
                        .map((coordinate) => {
                          if (coordinate.key == selectedKey) {
                            console.log("coordinate.key : ", rowData);
                            return {
                              height: rowData.height / scale,
                              page: rowData.page,
                              width: rowData.width / scale,
                              x: rowData.x / scale,
                              y: rowData.y / scale,
                              isConfirm: "Y",
                              key: selectedKey,
                              text: selectedText,
                            };
                          }
                          return coordinate;
                        });

                      // Set the updated coordinates in state
                      console.log("updatedCoordinates : ", updatedCoordinates);
                      setSelectedCoordinate(updatedCoordinates);
                      setRowData({ isVisible: false });
                      // console.log(rowData.x);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    value={"Remove"}
                    onClick={() => {
                      const updatedCoordinates = selectedCoordinate.filter(
                        (_, i) => i !== rowData.index
                      );

                      setSelectedCoordinate(updatedCoordinates);
                      setRowData({ isVisible: false });
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      <input type="file" onChange={handlePdfUpload} accept="application/pdf" />
    </>
  );
};

export default CanvasPDFViewer;
