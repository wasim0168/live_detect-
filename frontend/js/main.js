// main.js - optimized client for faster detection (replace your existing main.js in frontend/js/)

async function api(path, method='GET', body){
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if(body) opts.body = JSON.stringify(body);
  const res = await fetch('/api' + path, opts);
  if(!res.ok) throw new Error('API error ' + res.status);
  return res.json();
}

/* -- Live detection optimized -- */
if(document.getElementById('video')){
  (function(){
    const video = document.getElementById('video');
    const overlay = document.getElementById('overlay');
    const ctx = overlay.getContext('2d');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const intervalInput = document.getElementById('interval'); // ms between sends
    const imgszInput = document.getElementById('imgsz'); // model imgsz
    const alertsBox = document.getElementById('alertsBox');

    let stream = null;
    let running = false;
    let frameCount = 0;
    const FRAME_SKIP = 2; // smaller skip = faster detection (was 3)

   async function startCamera(){
  stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:false });
  video.srcObject = stream;
  await video.play();

  // Ensure canvas matches video resolution
  overlay.width = video.videoWidth;
  overlay.height = video.videoHeight;
}

    async function sendFrame(){
      if(!running) return;
      frameCount++;

      // Only process every FRAME_SKIP frames
      if(frameCount % FRAME_SKIP !== 0){
        setTimeout(sendFrame, Number(intervalInput.value || 200));
        return;
      }

      try{
        const imgsz = Number(imgszInput.value || 320); // lower imgsz = faster
        const scale = imgsz / Math.max(video.videoWidth, video.videoHeight);
        const w = Math.max(1, Math.floor(video.videoWidth * scale));
        const h = Math.max(1, Math.floor(video.videoHeight * scale));

        const off = document.createElement('canvas');
        off.width = w; off.height = h;
        const offCtx = off.getContext('2d');
        offCtx.drawImage(video, 0, 0, w, h);
        const dataUrl = off.toDataURL('image/jpeg', 0.5); // quality=0.5 for faster sending

        const resp = await fetch('/api/detect', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ image: dataUrl, imgsz: imgsz, conf: 0.35 })
        });

        const json = await resp.json();
        if(json.error){
          console.error('Detector error', json.error);
        } else {
          drawDetections(json);

          // save logs (non-blocking)
          fetch('/api/logs', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ id: Date.now(), timestamp: Date.now(), detections: json.detections })
          }).catch(()=>{});

          // alerts for weapons
          const weapons = (json.detections || []).filter(d =>
            d.category === 'weapon' || ['knife','gun','pistol','rifle'].includes((d.name||'').toLowerCase())
          );

          if(weapons.length){
            weapons.forEach(w => {
              const alert = { time: Date.now(), message: `Weapon detected: ${w.name}`, detection: w };
              fetch('/api/alerts', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify(alert)
              }).catch(()=>{});

              const el = document.createElement('div');
              el.className = 'alert';
              el.innerText = `[ALERT] ${new Date().toLocaleString()}: ${alert.message}`;
              alertsBox.prepend(el);
            });
          }
        }
      }catch(err){
        console.error('sendFrame error', err);
      } finally {
        setTimeout(sendFrame, Number(intervalInput.value || 200)); // faster loop
      }
    }

    function drawDetections(result){
  ctx.clearRect(0, 0, overlay.width, overlay.height);
  if(!result || !result.detections) return;

  // Scale factors (server → video canvas)
  const rx = overlay.width / result.width;
  const ry = overlay.height / result.height;

  ctx.lineWidth = 2;
  ctx.font = '14px Arial';

  result.detections.forEach(d => {
    // YOLO sends [cx, cy, w, h]
    const [cx, cy, w, h] = d.box;

    // convert to top-left corner
    const x = (cx - w/2) * rx;
    const y = (cy - h/2) * ry;
    const ww = w * rx;
    const hh = h * ry;

    let color = '#2b9af3'; // default blue
    if((d.name || '').toLowerCase() === 'person') color = '#22c55e';
    if(['knife','gun','pistol','rifle'].includes((d.name||'').toLowerCase())) color = '#ff4444';

    // draw box
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(x, y, ww, hh);
    ctx.stroke();

    // draw label
    const confPct = d.confidence ? Math.round(d.confidence * 100) + '%' : '';
    const label = `${d.name} ${confPct}`;
    const textX = x + 4;
    const textY = y > 10 ? y - 6 : y + 14;

    ctx.fillStyle = color;
    const textWidth = ctx.measureText(label).width;
    ctx.fillRect(textX - 2, textY - 14, textWidth + 6, 16);

    ctx.fillStyle = '#fff';
    ctx.fillText(label, textX, textY - 2);
  });
}


    startBtn.addEventListener('click', async ()=> {
      try {
        await startCamera();
        running = true;
        frameCount = 0;
        sendFrame();
      } catch(e) {
        alert('Camera error: ' + e.message);
      }
    });

    stopBtn.addEventListener('click', ()=> {
      running = false;
      if(stream) stream.getTracks().forEach(t=>t.stop());
    });

  })();
}

/* -----------------------------
   Upload & Detect Page
-------------------------------- */
const uploadInput = document.getElementById("uploadInput");
const uploadCanvas = document.getElementById("uploadCanvas");
const uctx = uploadCanvas?.getContext("2d");

uploadInput?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    uploadCanvas.width = img.width;
    uploadCanvas.height = img.height;
    uctx.drawImage(img, 0, 0);

    const imageBase64 = uploadCanvas.toDataURL("image/jpeg");

    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64, imgsz: 416, conf: 0.35 })
      });

      const result = await res.json();
      drawUploadDetections(result, img);
    } catch (err) {
      console.error("Upload detection failed:", err);
    }
  };
});

function drawUploadDetections(result, img) {
  uctx.drawImage(img, 0, 0, uploadCanvas.width, uploadCanvas.height);

  const rx = uploadCanvas.width / result.width;
  const ry = uploadCanvas.height / result.height;

  uctx.font = "14px Arial";

  result.detections.forEach(d => {
    const [cx, cy, w, h] = d.box;
    const x = (cx - w / 2) * rx;
    const y = (cy - h / 2) * ry;
    const ww = w * rx;
    const hh = h * ry;

    let color = "#2b9af3";
    if ((d.name || "").toLowerCase() === "person") color = "#22c55e";
    if (["knife", "gun", "pistol", "rifle"].includes((d.name || "").toLowerCase())) color = "#ff4444";

    uctx.strokeStyle = color;
    uctx.lineWidth = 3;
    uctx.strokeRect(x, y, ww, hh);

    const label = `${d.name} ${(d.confidence * 100).toFixed(1)}%`;
    const textX = x + 4;
    const textY = y > 10 ? y - 6 : y + 14;

    uctx.fillStyle = color;
    const textWidth = uctx.measureText(label).width;
    uctx.fillRect(textX - 2, textY - 14, textWidth + 6, 16);

    uctx.fillStyle = "#fff";
    uctx.fillText(label, textX, textY - 2);
  });
}