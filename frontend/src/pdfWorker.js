// src/pdfWorker.js
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import worker from "pdfjs-dist/build/pdf.worker.min.js?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
