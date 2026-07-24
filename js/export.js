const Export = {
  canvasToImage(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename || 'area-calculation.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  },

  buildCompositeCanvas(config) {
    const { title, inputs, results, sections, mainCanvasId, sectionCanvasPrefix } = config;

    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = 800;
    const LINE_HEIGHT = 28;
    const PADDING = 30;

    let totalH = PADDING;

    ctx.font = 'bold 18px Segoe UI, Tahoma, sans-serif';
    totalH += 35;
    totalH += 10;

    const inputKeys = Object.keys(inputs);
    const inputLines = [];
    for (let i = 0; i < inputKeys.length; i += 2) {
      const line = [];
      for (let j = i; j < Math.min(i + 2, inputKeys.length); j++) {
        line.push({ label: inputKeys[j], value: inputs[inputKeys[j]] });
      }
      inputLines.push(line);
    }
    totalH += inputLines.length * LINE_HEIGHT + 10;

    if (results) {
      totalH += 5;
      const resultKeys = Object.keys(results).filter(k => k !== 'units' && k !== 'errors' && k !== 'areaM2');
      if (results.areaM2 !== undefined) resultKeys.unshift('areaM2');
      const resultLines = [];
      for (let i = 0; i < resultKeys.length; i += 2) {
        const line = [];
        for (let j = i; j < Math.min(i + 2, resultKeys.length); j++) {
          const k = resultKeys[j];
          let val = results[k];
          if (k === 'units' && val && val.display) val = val.display;
          if (typeof val === 'object') continue;
          line.push({ label: k, value: val });
        }
        if (line.length > 0) resultLines.push(line);
      }
      totalH += resultLines.length * LINE_HEIGHT + 10;
    }

    const mainCanvas = document.getElementById(mainCanvasId);
    if (mainCanvas) {
      const cw = parseInt(mainCanvas.style.width) || mainCanvas.width;
      const ch = parseInt(mainCanvas.style.height) || mainCanvas.height;
      const drawW = Math.min(cw, W - PADDING * 2);
      const drawH = ch * (drawW / cw);
      totalH += drawH + 20;
    }

    if (sections && sections.length > 0) {
      totalH += 10;
      for (let i = 0; i < sections.length; i++) {
        totalH += LINE_HEIGHT + 5;
        const secCanvas = document.getElementById(`${sectionCanvasPrefix}${i + 1}`);
        if (secCanvas) {
          const cw = parseInt(secCanvas.style.width) || secCanvas.width;
          const ch = parseInt(secCanvas.style.height) || secCanvas.height;
          const drawW = Math.min(cw, W - PADDING * 2);
          const drawH = ch * (drawW / cw);
          totalH += drawH + 15;
        }
        totalH += 7 * LINE_HEIGHT + 10;
      }
    }

    totalH += PADDING;

    tempCanvas.width = W * dpr;
    tempCanvas.height = totalH * dpr;
    tempCanvas.style.width = W + 'px';
    tempCanvas.style.height = totalH + 'px';
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(0, 0, W, totalH);

    ctx.fillStyle = '#1a6b3c';
    ctx.fillRect(0, 0, W, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Segoe UI, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, W / 2, 25);

    let y = 65;

    ctx.fillStyle = '#0e4a28';
    ctx.font = 'bold 14px Segoe UI, Tahoma, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('المدخلات:', W - PADDING, y);
    y += 8;

    ctx.fillStyle = '#333';
    ctx.font = '13px Segoe UI, Tahoma, sans-serif';
    for (const line of inputLines) {
      let x = W - PADDING;
      for (const item of line) {
        const text = `${item.label}: ${item.value} م`;
        ctx.fillText(text, x, y + LINE_HEIGHT / 2);
        x -= (W - PADDING * 2) / 2;
      }
      y += LINE_HEIGHT;
    }
    y += 10;

    if (results) {
      ctx.fillStyle = '#0e4a28';
      ctx.font = 'bold 14px Segoe UI, Tahoma, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('النتائج:', W - PADDING, y);
      y += 8;

      const resultLabels = {
        areaM2: 'المساحة', h: 'الارتفاع', x1: 'x1', x2: 'x2',
        diag1: 'القطر الأول', diag2: 'القطر الثاني', perimeter: 'المحيط',
        h1: 'الارتفاع الأول', h2: 'الارتفاع الثاني', diag: 'القطر',
        area1: 'مساحة المثلث1', area2: 'مساحة المثلث2'
      };

      ctx.fillStyle = '#333';
      ctx.font = '13px Segoe UI, Tahoma, sans-serif';
      const resultKeys = Object.keys(results).filter(k => k !== 'units' && k !== 'errors');
      const resultLines2 = [];
      for (let i = 0; i < resultKeys.length; i += 2) {
        const line = [];
        for (let j = i; j < Math.min(i + 2, resultKeys.length); j++) {
          const k = resultKeys[j];
          let val = results[k];
          if (typeof val === 'object') continue;
          const label = resultLabels[k] || k;
          line.push({ label, value: val });
        }
        if (line.length > 0) resultLines2.push(line);
      }

      for (const line of resultLines2) {
        let x = W - PADDING;
        for (const item of line) {
          const unit = item.label.includes('المساحة') || item.label.includes('مساحة') ? 'م²' : 'م';
          const text = `${item.label}: ${item.value} ${unit}`;
          ctx.fillText(text, x, y + LINE_HEIGHT / 2);
          x -= (W - PADDING * 2) / 2;
        }
        y += LINE_HEIGHT;
      }

      if (results.units && results.units.display) {
        ctx.fillStyle = '#1a6b3c';
        ctx.font = 'bold 13px Segoe UI, Tahoma, sans-serif';
        ctx.fillText(`بالوحدات: ${results.units.display}`, W - PADDING, y + LINE_HEIGHT / 2);
        y += LINE_HEIGHT;
      }
      y += 10;
    }

    if (mainCanvas) {
      const cw = parseInt(mainCanvas.style.width) || mainCanvas.width;
      const ch = parseInt(mainCanvas.style.height) || mainCanvas.height;
      const drawW = Math.min(cw, W - PADDING * 2);
      const drawH = ch * (drawW / cw);
      ctx.drawImage(mainCanvas, 0, 0, cw, ch, (W - drawW) / 2, y, drawW, drawH);
      y += drawH + 20;
    }

    if (sections && sections.length > 0) {
      ctx.fillStyle = '#e65100';
      ctx.font = 'bold 14px Segoe UI, Tahoma, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`الأقسام (${sections.length} قسم):`, W - PADDING, y);
      y += 8;

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];

        ctx.fillStyle = '#e65100';
        ctx.font = 'bold 13px Segoe UI, Tahoma, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`القسم ${sec.index}:`, W - PADDING, y + LINE_HEIGHT / 2);
        y += LINE_HEIGHT;

        ctx.fillStyle = '#333';
        ctx.font = '12px Segoe UI, Tahoma, sans-serif';
        const secData = [
          `المساحة: ${sec.areaM2} م²`,
          sec.units ? `بالوحدات: ${sec.units.display}` : null,
          `القاعدة العلوية: ${sec.a} م`,
          `القاعدة السفلية: ${sec.b} م`,
          `الضلع الأيمن: ${sec.c} م`,
          `الضلع الأيسر: ${sec.d} م`,
          `الارتفاع: ${sec.h} م`,
          `القطر الأول: ${sec.diag1} م`,
          `القطر الثاني: ${sec.diag2} م`
        ].filter(Boolean);

        for (let j = 0; j < secData.length; j += 2) {
          let x = W - PADDING;
          for (let k = j; k < Math.min(j + 2, secData.length); k++) {
            ctx.fillText(secData[k], x, y + LINE_HEIGHT / 2);
            x -= (W - PADDING * 2) / 2;
          }
          y += LINE_HEIGHT;
        }

        const secCanvas = document.getElementById(`${sectionCanvasPrefix}${i + 1}`);
        if (secCanvas) {
          const cw = parseInt(secCanvas.style.width) || secCanvas.width;
          const ch = parseInt(secCanvas.style.height) || secCanvas.height;
          const drawW2 = Math.min(cw, W - PADDING * 2);
          const drawH2 = ch * (drawW2 / cw);
          ctx.drawImage(secCanvas, 0, 0, cw, ch, (W - drawW2) / 2, y, drawW2, drawH2);
          y += drawH2 + 15;
        }
      }
    }

    ctx.fillStyle = '#999';
    ctx.font = '10px Segoe UI, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(new Date().toLocaleString('ar-EG'), W / 2, totalH - 10);

    return tempCanvas;
  },

  exportFullPage(config) {
    const canvas = this.buildCompositeCanvas(config);
    const link = document.createElement('a');
    link.download = `${config.title.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  },

  printFullPage(config) {
    const canvas = this.buildCompositeCanvas(config);
    const dataUrl = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>${config.title}</title>
      <style>
        @page{margin:10mm}
        body{margin:0;padding:0;display:flex;justify-content:center;align-items:flex-start;background:#fff}
        img{max-width:100%;height:auto}
      </style></head><body>
      <img src="${dataUrl}" onload="window.print();window.close()">
      </body></html>`);
    win.document.close();
  },

  saveFullData(config) {
    const { title, inputs, results, sections } = config;
    const data = {
      title,
      date: new Date().toLocaleString('ar-EG'),
      inputs,
      results,
      sections: sections ? sections.map(s => ({
        index: s.index, a: s.a, b: s.b, c: s.c, d: s.d,
        h: s.h, areaM2: s.areaM2, diag1: s.diag1, diag2: s.diag2,
        units: s.units
      })) : []
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
