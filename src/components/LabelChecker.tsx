"use client";

import { useEffect, useRef, useState } from "react";
import { analyzeIngredientText, fodmapGroupNames } from "@/lib/fodmap-guide";
import { cleanRecognizedLabelText, readableLabelText } from "@/lib/label-ocr";
import type { IScannerControls } from "@zxing/browser";
import type { ProductLookup } from "@/lib/open-food-facts";

async function prepareLabelImage(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const maxSide = 2200;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("canvas");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const gray = image.data[index] * .299 + image.data[index + 1] * .587 + image.data[index + 2] * .114;
    const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.45 + 128));
    image.data[index] = contrasted; image.data[index + 1] = contrasted; image.data[index + 2] = contrasted;
  }
  context.putImageData(image, 0, 0);
  return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("image")), "image/jpeg", .92));
}

export function LabelChecker() {
  const [value, setValue] = useState("");
  const [checkedValue, setCheckedValue] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [product, setProduct] = useState<ProductLookup | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const scannerControls = useRef<IScannerControls | null>(null);
  const findings = checkedValue ? analyzeIngredientText(checkedValue) : [];
  useEffect(() => () => scannerControls.current?.stop(), []);

  function stopBarcodeScanner() {
    scannerControls.current?.stop();
    scannerControls.current = null;
    setBarcodeScanning(false);
  }

  async function lookupProduct(barcode: string) {
    setProductLoading(true); setScanError(null);
    try {
      const response = await fetch(`/api/product/${encodeURIComponent(barcode)}`);
      const result = await response.json() as ProductLookup | { error?: string };
      if (!response.ok || !("barcode" in result)) throw new Error("error" in result ? result.error : undefined);
      setProduct(result);
      if (!result.ingredients) {
        setScanError(`${result.name || "Dit product"} is gevonden, maar de ingrediëntenlijst ontbreekt. Gebruik hieronder de fotoherkenning.`);
        return;
      }
      setValue(result.ingredients); setCheckedValue(result.ingredients);
    } catch (error) {
      setProduct(null);
      setScanError(error instanceof Error && error.message && error.message !== "error" ? error.message : "Dit product staat nog niet in de productendatabank. Gebruik hieronder de fotoherkenning.");
    } finally { setProductLoading(false); }
  }

  async function startBarcodeScanner() {
    setScanError(null); setProduct(null); setBarcodeScanning(true);
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const { BrowserMultiFormatOneDReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatOneDReader(undefined, { delayBetweenScanAttempts: 250 });
      if (!video.current) throw new Error("camera");
      scannerControls.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
        video.current,
        (result) => {
          if (!result) return;
          const barcode = result.getText();
          stopBarcodeScanner();
          void lookupProduct(barcode);
        },
      );
    } catch {
      stopBarcodeScanner();
      setScanError("De camera kon niet worden geopend. Controleer de cameratoestemming in je browser of gebruik de fotoherkenning hieronder.");
    }
  }
  async function scanLabel(file: File) {
    setScanning(true); setProgress(0); setScanError(null);
    try {
      const [{ createWorker, PSM }, image] = await Promise.all([import("tesseract.js"), prepareLabelImage(file)]);
      const worker = await createWorker("nld+eng", 1, {
        logger(message) {
          if (message.status === "recognizing text" && typeof message.progress === "number") setProgress(Math.round(message.progress * 100));
        },
      });
      try {
        await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT, preserve_interword_spaces: "1" });
        const result = await worker.recognize(image);
        const text = cleanRecognizedLabelText(result.data.text);
        if (!readableLabelText(text, result.data.confidence)) throw new Error("low-confidence");
        setValue(text); setCheckedValue(text);
      } finally { await worker.terminate(); }
    } catch {
      setScanError("De tekst was niet goed genoeg leesbaar en is daarom niet geanalyseerd. Fotografeer alleen het ingrediëntenblok van dichtbij, houd de camera recht en vermijd schittering.");
    } finally { setScanning(false); setProgress(0); if (cameraInput.current) cameraInput.current.value=""; }
  }
  return (
    <section className="card" id="etiketcontrole">
      <h2 className="section-title">Etiketcontrole</h2>
      <p className="subtle">
        Scan eerst de barcode: zo halen we de ingrediënten op zonder kleine etikettekst te moeten ontcijferen. We signaleren alleen bekende
        aandachtspunten; dit vervangt geen producttest of diëtist.
      </p>
      <div className="label-scan-actions">
        {!barcodeScanning ? (
          <button className="btn" type="button" disabled={productLoading || scanning} onClick={()=>void startBarcodeScanner()}>
            {productLoading ? "Product ophalen…" : "▥ Scan barcode"}
          </button>
        ) : (
          <button className="btn btn-secondary" type="button" onClick={stopBarcodeScanner}>Scanner sluiten</button>
        )}
      </div>
      {barcodeScanning && (
        <div className="barcode-camera" role="region" aria-label="Barcodescanner">
          <video ref={video} muted playsInline />
          <span>Houd de streepjescode binnen het kader</span>
        </div>
      )}
      {product && (
        <div className="product-found" aria-live="polite">
          <strong>{product.name || "Product gevonden"}</strong>
          <span>{[product.brand, product.barcode].filter(Boolean).join(" · ")}</span>
        </div>
      )}
      <p className="subtle label-data-source">Productgegevens via Open Food Facts. Controleer de gevonden ingrediënten altijd op de verpakking.</p>
      <div className="label-fallback"><span>Geen resultaat via de barcode?</span></div>
      <div className="label-scan-actions">
        <button className="btn" type="button" disabled={scanning} onClick={()=>cameraInput.current?.click()}>
          {scanning ? `Tekst herkennen… ${progress}%` : "📷 Fotografeer ingrediënten (reserve)"}
        </button>
        <input ref={cameraInput} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event)=>{const file=event.target.files?.[0];if(file)void scanLabel(file)}} />
      </div>
      <p className="subtle label-scan-tip">Fotoherkenning blijft minder betrouwbaar: vul het beeld uitsluitend met het ingrediëntenblok, houd de verpakking vlak en vermijd spiegeling. De foto wordt lokaal verwerkt en niet opgeslagen.</p>
      {scanning && <div className="scan-progress" role="status" aria-live="polite"><span style={{width:`${Math.max(progress,4)}%`}} /></div>}
      {scanError && <div className="notice notice-error">{scanError}</div>}
      <form onSubmit={(event) => { event.preventDefault(); setCheckedValue(value.trim()); }}>
        <textarea
          name="check"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={4000}
          required
          placeholder="De herkende ingrediënten verschijnen hier automatisch…"
          style={{ width: "100%", minHeight: 130 }}
        />
        <button className="btn" type="submit" style={{ marginTop: 10 }}>
          Tekst controleren
        </button>
      </form>
      {checkedValue !== null && (
        checkedValue.length === 0 ? (
          <div className="notice notice-error">Vul eerst een ingrediëntenlijst in.</div>
        ) : findings.length ? (
          <ul className="check-findings">
            {findings.map((finding, index) => (
              <li key={`${finding.label}-${index}`}>
                <span className="pill status-portie-telt">Let op</span>
                <strong>{finding.label}</strong>
                <small>{fodmapGroupNames[finding.group]}</small>
              </li>
            ))}
          </ul>
        ) : (
          <div className="notice">
            Geen ingebouwd signaal gevonden. Dat betekent niet automatisch dat
            het product geschikt is.
          </div>
        )
      )}
    </section>
  );
}
