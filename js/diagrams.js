if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (typeof r === 'number') r = [r, r, r, r];
    this.moveTo(x + r[0], y);
    this.lineTo(x + w - r[1], y);
    this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
    this.lineTo(x + w, y + h - r[2]);
    this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
    this.lineTo(x + r[3], y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
    this.lineTo(x, y + r[0]);
    this.quadraticCurveTo(x, y, x + r[0], y);
    this.closePath();
  };
}

const Diagrams = {
  COLORS: {
    shape: '#1a6b3c',
    shapeFill: 'rgba(26,107,60,0.08)',
    height: '#d32f2f',
    diag: '#1565c0',
    division: '#e65100',
    text: '#333',
    labelBg: 'rgba(255,255,255,0.85)',
    labelBgHeight: 'rgba(255,255,255,0.85)',
    grid: '#e0e0e0'
  },

  getScale(w, h, maxW, maxH) {
    const padding = 100;
    const scaleX = (maxW - padding * 2) / w;
    const scaleY = (maxH - padding * 2) / h;
    return Math.min(scaleX, scaleY);
  },

  drawLabel(ctx, text, x, y, bgColor, textColor, fontSize) {
    fontSize = fontSize || 11;
    ctx.font = `bold ${fontSize}px Segoe UI, Tahoma, sans-serif`;
    const metrics = ctx.measureText(text);
    const padX = 5, padY = 3;
    const boxW = metrics.width + padX * 2;
    const boxH = fontSize + padY * 2;

    ctx.fillStyle = bgColor || this.COLORS.labelBg;
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = textColor || this.COLORS.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  },

  drawDashedLine(ctx, x1, y1, x2, y2, color) {
    ctx.save();
    ctx.strokeStyle = color || this.COLORS.diag;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },

  drawSolidLine(ctx, x1, y1, x2, y2, color, width) {
    ctx.save();
    ctx.strokeStyle = color || this.COLORS.shape;
    ctx.lineWidth = width || 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  },

  drawHeightLine(ctx, x, y1, y2) {
    const color = this.COLORS.height;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);

    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();

    const arrowSize = 6;
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x - arrowSize, y1 + arrowSize);
    ctx.lineTo(x + arrowSize, y1 + arrowSize);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y2);
    ctx.lineTo(x - arrowSize, y2 - arrowSize);
    ctx.lineTo(x + arrowSize, y2 - arrowSize);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - 8, y1);
    ctx.lineTo(x + 8, y1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 8, y2);
    ctx.lineTo(x + 8, y2);
    ctx.stroke();
    ctx.restore();
  },

  drawTrapezoid(canvas, data, divisions, sectionHeight) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const padding = 120;
    const maxCanvasW = Math.min(700, window.innerWidth - 80);
    const maxCanvasH = 500;

    const { a, b, c, d, h, x1, x2, diag1, diag2, leftTopX } = data;
    const ltX = leftTopX !== undefined ? leftTopX : x2;

    const minX = Math.min(0, ltX);
    const maxX = Math.max(b, ltX + a);
    const shapeW = maxX - minX;
    const shapeH = h;

    const scale = this.getScale(shapeW, shapeH, maxCanvasW, maxCanvasH);

    const canvasW = (shapeW * scale + padding * 2);
    const canvasH = (shapeH * scale + padding * 2);

    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, canvasW, canvasH);

    const offsetX = padding - minX * scale;
    const offsetY = padding;

    const pts = [
      { x: offsetX + ltX * scale, y: offsetY },
      { x: offsetX + (ltX + a) * scale, y: offsetY },
      { x: offsetX + b * scale, y: offsetY + h * scale },
      { x: offsetX, y: offsetY + h * scale }
    ];

    ctx.fillStyle = this.COLORS.shapeFill;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = this.COLORS.shape;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();

    this.drawSolidLine(ctx, pts[0].x, pts[0].y, pts[1].x, pts[1].y, this.COLORS.shape, 3);
    this.drawSolidLine(ctx, pts[3].x, pts[3].y, pts[2].x, pts[2].y, this.COLORS.shape, 3);

    this.drawDashedLine(ctx, pts[0].x, pts[0].y, pts[2].x, pts[2].y, this.COLORS.diag);
    this.drawDashedLine(ctx, pts[1].x, pts[1].y, pts[3].x, pts[3].y, this.COLORS.diag);

    const midTopX = (pts[0].x + pts[1].x) / 2;
    const midBotX = (pts[3].x + pts[2].x) / 2;
    const hx = midTopX + (midBotX - midTopX) * 0.3;
    this.drawHeightLine(ctx, hx, pts[0].y, pts[3].y);
    this.drawLabel(ctx, `h=${h}`, hx + 18, (pts[0].y + pts[3].y) / 2, 'rgba(255,255,255,0.9)', this.COLORS.height, 10);

    const topMidX = (pts[0].x + pts[1].x) / 2;
    this.drawLabel(ctx, `${a}`, topMidX, pts[0].y - 14, 'rgba(26,107,60,0.15)', this.COLORS.shape, 11);

    const botMidX = (pts[3].x + pts[2].x) / 2;
    this.drawLabel(ctx, `${b}`, botMidX, pts[3].y + 16, 'rgba(26,107,60,0.15)', this.COLORS.shape, 11);

    const leftMidX = (pts[0].x + pts[3].x) / 2 - 28;
    const leftMidY = (pts[0].y + pts[3].y) / 2;
    this.drawLabel(ctx, `d=${d}`, leftMidX, leftMidY, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);

    const rightMidX = (pts[1].x + pts[2].x) / 2 + 28;
    const rightMidY = (pts[1].y + pts[2].y) / 2;
    this.drawLabel(ctx, `c=${c}`, rightMidX, rightMidY, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);

    const absX1 = Math.abs(x1);
    const absX2 = Math.abs(x2);
    const x2LabelY = pts[3].y + 32;
    if (absX2 > 0.1) {
      const x2Left = Math.min(pts[3].x, pts[0].x);
      const x2Right = Math.max(pts[3].x, pts[0].x);
      this.drawLabel(ctx, `x2=${x2}`, (x2Left + x2Right) / 2, x2LabelY, 'rgba(156,39,176,0.15)', '#7b1fa2', 9);
    }
    if (absX1 > 0.1) {
      const x1Left = Math.min(pts[1].x, pts[2].x);
      const x1Right = Math.max(pts[1].x, pts[2].x);
      this.drawLabel(ctx, `x1=${x1}`, (x1Left + x1Right) / 2, x2LabelY, 'rgba(255,152,0,0.15)', '#e65100', 9);
    }

    const d1MidX = (pts[0].x + pts[2].x) / 2 - 8;
    const d1MidY = (pts[0].y + pts[2].y) / 2 - 8;
    this.drawLabel(ctx, `d1=${diag1}`, d1MidX, d1MidY, 'rgba(21,101,192,0.15)', this.COLORS.diag, 9);

    const d2MidX = (pts[1].x + pts[3].x) / 2 + 8;
    const d2MidY = (pts[1].y + pts[3].y) / 2 - 8;
    this.drawLabel(ctx, `d2=${diag2}`, d2MidX, d2MidY, 'rgba(21,101,192,0.15)', this.COLORS.diag, 9);

    if (divisions && divisions.length > 0) {
      const leftBottomXVal = 0;
      const leftTopXVal = ltX;

      for (let i = 0; i < divisions.length; i++) {
        const div = divisions[i];
        const yTop = div.yTop;
        const yBot = div.yBottom;

        const ltX = offsetX + this.interpolateEdge(leftTopXVal, leftBottomXVal, h, yTop) * scale;
        const lbX = offsetX + this.interpolateEdge(leftTopXVal, leftBottomXVal, h, yBot) * scale;

        const wTopP = this.widthAtHeight(h, a, b, yTop);
        const wBotP = this.widthAtHeight(h, a, b, yBot);

        const rtX = ltX + wTopP * scale;
        const rbX = lbX + wBotP * scale;

        const yTopP = offsetY + yTop * scale;
        const yBotP = offsetY + yBot * scale;

        ctx.save();
        ctx.fillStyle = `hsla(${(i * 360 / divisions.length) % 360}, 50%, 95%, 0.5)`;
        ctx.beginPath();
        ctx.moveTo(ltX, yTopP);
        ctx.lineTo(rtX, yTopP);
        ctx.lineTo(rbX, yBotP);
        ctx.lineTo(lbX, yBotP);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = this.COLORS.division;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.restore();

        if (i > 0) {
          ctx.save();
          ctx.strokeStyle = this.COLORS.division;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ltX, yTopP);
          ctx.lineTo(rtX, yTopP);
          ctx.stroke();
          ctx.restore();
        }

        const secCenterX = (ltX + rtX + rbX + lbX) / 4;
        const secCenterY = (yTopP + yBotP) / 2;
        this.drawLabel(ctx, `${i + 1}`, secCenterX, secCenterY, 'rgba(230,81,0,0.8)', '#fff', 16);
      }
    }

    ctx.save();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Segoe UI, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('شبه المنحرف', canvasW / 2, 20);
    ctx.restore();
  },

  drawTrapezoidSection(canvas, section, index, hTotal, a, b) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const maxCanvasW = Math.min(500, window.innerWidth - 60);
    const maxCanvasH = 350;

    const secW = Math.max(section.a, section.b);
    const secH = section.h;

    const leftBottomX = section.leftBottomX || 0;
    const leftTopX = section.leftTopX || 0;

    const minX = Math.min(leftBottomX, leftTopX);
    const maxX = Math.max(leftBottomX + section.b, leftTopX + section.a);
    const totalW = maxX - minX;

    const scale = this.getScale(totalW, secH, maxCanvasW, maxCanvasH);

    const canvasW = totalW * scale + 140;
    const canvasH = secH * scale + 100;

    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasW, canvasH);

    const ox = 50 - minX * scale;
    const oy = 30;

    const pts = [
      { x: ox + leftTopX * scale, y: oy },
      { x: ox + (leftTopX + section.a) * scale, y: oy },
      { x: ox + (leftBottomX + section.b) * scale, y: oy + secH * scale },
      { x: ox + leftBottomX * scale, y: oy + secH * scale }
    ];

    ctx.fillStyle = `hsla(${((index - 1) * 60) % 360}, 40%, 95%, 0.6)`;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = this.COLORS.shape;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();

    this.drawDashedLine(ctx, pts[0].x, pts[0].y, pts[2].x, pts[2].y, this.COLORS.diag);
    this.drawDashedLine(ctx, pts[1].x, pts[1].y, pts[3].x, pts[3].y, this.COLORS.diag);

    const hx = pts[0].x + (pts[3].x - pts[0].x) * 0.3;
    this.drawHeightLine(ctx, hx, pts[0].y, pts[3].y);
    this.drawLabel(ctx, `h=${section.h}`, hx + 16, (pts[0].y + pts[3].y) / 2, this.COLORS.labelBgHeight, this.COLORS.height, 9);

    this.drawLabel(ctx, `${section.a}`, (pts[0].x + pts[1].x) / 2, pts[0].y - 12, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);
    this.drawLabel(ctx, `${section.b}`, (pts[2].x + pts[3].x) / 2, pts[3].y + 14, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);

    const leftMidX = (pts[0].x + pts[3].x) / 2 - 22;
    const leftMidY = (pts[0].y + pts[3].y) / 2;
    this.drawLabel(ctx, `d=${section.d}`, leftMidX, leftMidY, 'rgba(26,107,60,0.15)', this.COLORS.shape, 9);

    const rightMidX = (pts[1].x + pts[2].x) / 2 + 22;
    const rightMidY = (pts[1].y + pts[2].y) / 2;
    this.drawLabel(ctx, `c=${section.c}`, rightMidX, rightMidY, 'rgba(26,107,60,0.15)', this.COLORS.shape, 9);

    this.drawLabel(ctx, `d1=${section.diag1}`, (pts[0].x + pts[2].x) / 2 - 8, (pts[0].y + pts[2].y) / 2 - 8, 'rgba(21,101,192,0.15)', this.COLORS.diag, 8);
    this.drawLabel(ctx, `d2=${section.diag2}`, (pts[1].x + pts[3].x) / 2 + 8, (pts[1].y + pts[3].y) / 2 - 8, 'rgba(21,101,192,0.15)', this.COLORS.diag, 8);

    ctx.save();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 11px Segoe UI, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`القسم ${index}`, canvasW / 2, 16);
    ctx.restore();
  },

  drawCyclicQuad(canvas, data, divisions) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const maxCanvasW = Math.min(700, window.innerWidth - 80);
    const maxCanvasH = 500;

    const { a, b, c, d, h, diag1, diag2 } = data;

    const leftTopX = 0;
    const leftBottomX = Math.sqrt(Math.max(0, d * d - h * h));

    const minX = Math.min(leftTopX, leftBottomX);
    const maxX = Math.max(leftTopX + a, leftBottomX + c);
    const shapeW = maxX - minX;
    const shapeH = h;

    const scale = this.getScale(shapeW, shapeH, maxCanvasW, maxCanvasH);

    const canvasW = shapeW * scale + 200;
    const canvasH = shapeH * scale + 180;

    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasW, canvasH);

    const offsetX = 100 - minX * scale;
    const offsetY = 90;

    const pts = [
      { x: offsetX + leftTopX * scale, y: offsetY },
      { x: offsetX + (leftTopX + a) * scale, y: offsetY },
      { x: offsetX + (leftBottomX + c) * scale, y: offsetY + h * scale },
      { x: offsetX + leftBottomX * scale, y: offsetY + h * scale }
    ];

    ctx.fillStyle = this.COLORS.shapeFill;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = this.COLORS.shape;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();

    this.drawDashedLine(ctx, pts[0].x, pts[0].y, pts[2].x, pts[2].y, this.COLORS.diag);
    this.drawDashedLine(ctx, pts[1].x, pts[1].y, pts[3].x, pts[3].y, this.COLORS.diag);

    const labels = [
      { text: `${a}`, x: (pts[0].x + pts[1].x) / 2, y: pts[0].y - 14 },
      { text: `${b}`, x: (pts[1].x + pts[2].x) / 2 + 30, y: (pts[1].y + pts[2].y) / 2 },
      { text: `${c}`, x: (pts[3].x + pts[2].x) / 2, y: pts[3].y + 16 },
      { text: `${d}`, x: (pts[0].x + pts[3].x) / 2 - 30, y: (pts[0].y + pts[3].y) / 2 }
    ];

    labels.forEach(l => {
      this.drawLabel(ctx, l.text, l.x, l.y, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);
    });

    this.drawLabel(ctx, `d1=${diag1}`, (pts[0].x + pts[2].x) / 2 - 20, (pts[0].y + pts[2].y) / 2 - 10, 'rgba(21,101,192,0.15)', this.COLORS.diag, 9);
    this.drawLabel(ctx, `d2=${diag2}`, (pts[1].x + pts[3].x) / 2 + 20, (pts[1].y + pts[3].y) / 2 - 10, 'rgba(21,101,192,0.15)', this.COLORS.diag, 9);

    const hx = (pts[0].x + pts[3].x) / 2 + (pts[1].x - pts[0].x) * 0.15;
    this.drawHeightLine(ctx, hx, pts[0].y, pts[3].y);
    this.drawLabel(ctx, `h=${h}`, hx + 20, (pts[0].y + pts[3].y) / 2, this.COLORS.labelBgHeight, this.COLORS.height, 9);

    if (divisions && divisions.length > 0) {
      for (let i = 0; i < divisions.length; i++) {
        const div = divisions[i];
        const yTop = div.yTop || 0;
        const yBot = div.yBottom !== undefined ? div.yBottom : (yTop + (div.h || 0));

        const ltx = offsetX + this.interpolateEdge(leftTopX, leftBottomX, h, yTop) * scale;
        const lbx = offsetX + this.interpolateEdge(leftTopX, leftBottomX, h, yBot) * scale;

        const wTopP = this.widthAtHeight(h, a, c, yTop);
        const wBotP = this.widthAtHeight(h, a, c, yBot);

        const rtX = ltx + wTopP * scale;
        const rbX = lbx + wBotP * scale;

        const yTopP = offsetY + yTop * scale;
        const yBotP = offsetY + yBot * scale;

        ctx.save();
        ctx.fillStyle = `hsla(${(i * 360 / divisions.length) % 360}, 50%, 95%, 0.5)`;
        ctx.beginPath();
        ctx.moveTo(ltx, yTopP);
        ctx.lineTo(rtX, yTopP);
        ctx.lineTo(rbX, yBotP);
        ctx.lineTo(lbx, yBotP);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = this.COLORS.division;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.restore();

        if (i > 0) {
          ctx.save();
          ctx.strokeStyle = this.COLORS.division;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ltx, yTopP);
          ctx.lineTo(rtX, yTopP);
          ctx.stroke();
          ctx.restore();
        }

        const secCenterX = (ltx + rtX + rbX + lbx) / 4;
        const secCenterY = (yTopP + yBotP) / 2;
        this.drawLabel(ctx, `${i + 1}`, secCenterX, secCenterY, 'rgba(230,81,0,0.8)', '#fff', 16);
      }
    }

    ctx.save();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Segoe UI, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('الرباعي الدائري', canvasW / 2, 18);
    ctx.restore();
  },

  drawCyclicQuadSection(canvas, section, index, origData) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const maxCanvasW = Math.min(500, window.innerWidth - 60);
    const maxCanvasH = 350;

    const hTotal = origData.h;
    const leftTopX = 0;
    const leftBottomX = Math.sqrt(Math.max(0, origData.d * origData.d - hTotal * hTotal));

    const yTop = section.yTop || 0;
    const yBottom = section.yBottom !== undefined ? section.yBottom : (yTop + section.h);

    const wTop = this.widthAtHeight(hTotal, origData.a, origData.c, yTop);
    const wBottom = this.widthAtHeight(hTotal, origData.a, origData.c, yBottom);

    const ltx = this.interpolateEdge(leftTopX, leftBottomX, hTotal, yTop);
    const lbx = this.interpolateEdge(leftTopX, leftBottomX, hTotal, yBottom);

    const pts = [
      { x: ltx, y: yTop },
      { x: ltx + wTop, y: yTop },
      { x: lbx + wBottom, y: yBottom },
      { x: lbx, y: yBottom }
    ];

    const minX = Math.min(ltx, lbx);
    const maxX = Math.max(ltx + wTop, lbx + wBottom);
    const totalW = maxX - minX;
    const secH = yBottom - yTop;

    const scale = this.getScale(totalW, secH, maxCanvasW, maxCanvasH);

    const canvasW = totalW * scale + 140;
    const canvasH = secH * scale + 100;

    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasW, canvasH);

    const ox = 70 - minX * scale;
    const oy = 30;

    const dPts = pts.map(p => ({ x: ox + p.x * scale, y: oy + (p.y - yTop) * scale }));

    ctx.fillStyle = `hsla(${((index - 1) * 60) % 360}, 40%, 95%, 0.6)`;
    ctx.beginPath();
    ctx.moveTo(dPts[0].x, dPts[0].y);
    for (let i = 1; i < dPts.length; i++) ctx.lineTo(dPts[i].x, dPts[i].y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = this.COLORS.shape;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dPts[0].x, dPts[0].y);
    for (let i = 1; i < dPts.length; i++) ctx.lineTo(dPts[i].x, dPts[i].y);
    ctx.closePath();
    ctx.stroke();

    this.drawDashedLine(ctx, dPts[0].x, dPts[0].y, dPts[2].x, dPts[2].y, this.COLORS.diag);
    this.drawDashedLine(ctx, dPts[1].x, dPts[1].y, dPts[3].x, dPts[3].y, this.COLORS.diag);

    const hx = dPts[0].x + (dPts[3].x - dPts[0].x) * 0.3;
    this.drawHeightLine(ctx, hx, dPts[0].y, dPts[3].y);
    this.drawLabel(ctx, `h=${section.h}`, hx + 16, (dPts[0].y + dPts[3].y) / 2, this.COLORS.labelBgHeight, this.COLORS.height, 9);

    const isAC = section.leftTopX !== undefined;
    const botWidth = isAC ? section.c : section.b;
    const rightEdge = isAC ? section.b : section.c;

    this.drawLabel(ctx, `${section.a}`, (dPts[0].x + dPts[1].x) / 2, dPts[0].y - 12, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);
    this.drawLabel(ctx, `${botWidth}`, (dPts[2].x + dPts[3].x) / 2, dPts[3].y + 14, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);

    const leftMidX = (dPts[0].x + dPts[3].x) / 2 - 22;
    const leftMidY = (dPts[0].y + dPts[3].y) / 2;
    this.drawLabel(ctx, `d=${section.d}`, leftMidX, leftMidY, 'rgba(26,107,60,0.15)', this.COLORS.shape, 9);

    const rightMidX = (dPts[1].x + dPts[2].x) / 2 + 22;
    const rightMidY = (dPts[1].y + dPts[2].y) / 2;
    this.drawLabel(ctx, `c=${rightEdge}`, rightMidX, rightMidY, 'rgba(26,107,60,0.15)', this.COLORS.shape, 9);

    this.drawLabel(ctx, `d1=${section.diag1}`, (dPts[0].x + dPts[2].x) / 2 - 8, (dPts[0].y + dPts[2].y) / 2 - 8, 'rgba(21,101,192,0.15)', this.COLORS.diag, 8);
    this.drawLabel(ctx, `d2=${section.diag2}`, (dPts[1].x + dPts[3].x) / 2 + 8, (dPts[1].y + dPts[3].y) / 2 - 8, 'rgba(21,101,192,0.15)', this.COLORS.diag, 8);

    ctx.save();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 11px Segoe UI, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`القسم ${index}`, canvasW / 2, 16);
    ctx.restore();
  },

  drawIrregularQuad(canvas, data, divisions) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const maxCanvasW = Math.min(700, window.innerWidth - 80);
    const maxCanvasH = 500;

    const { a, b, c, d, diag, h1, h2, diag2 } = data;

    const totalH = h1 + h2;
    const scale = this.getScale(Math.max(diag, totalH) * 1.5, totalH * 1.5, maxCanvasW, maxCanvasH);

    const canvasW = diag * scale + 200;
    const canvasH = totalH * scale + 200;

    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasW, canvasH);

    const ox = canvasW / 2 - diag * scale / 2;
    const oy = canvasH / 2 - totalH * scale / 2;

    const diagLeft = ox + diag * scale * 0.15;
    const diagRight = ox + diag * scale * 0.85;
    const diagMidX = (diagLeft + diagRight) / 2;

    const topY = oy + h2 * scale;
    const botY = oy + (h1 + h2) * scale;

    const topX = diagMidX;
    const botX = diagMidX + diag * scale * 0.1;

    const pts = [
      { x: diagLeft, y: topY },
      { x: diagRight, y: topY },
      { x: botX, y: botY },
      { x: diagLeft - diag * scale * 0.15, y: botY }
    ];

    ctx.fillStyle = this.COLORS.shapeFill;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = this.COLORS.shape;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();

    this.drawSolidLine(ctx, diagLeft, topY, diagRight, topY, this.COLORS.shape, 3);
    this.drawSolidLine(ctx, diagRight, topY, botX, botY, this.COLORS.shape, 3);
    this.drawSolidLine(ctx, botX, botY, pts[3].x, botY, this.COLORS.shape, 3);
    this.drawSolidLine(ctx, pts[3].x, botY, diagLeft, topY, this.COLORS.shape, 3);

    if (diag2 > 0) {
      this.drawDashedLine(ctx, diagRight, topY, pts[3].x, botY, this.COLORS.diag);
      this.drawLabel(ctx, `d2=${diag2}`, (diagRight + pts[3].x) / 2 + 16, (topY + botY) / 2, 'rgba(21,101,192,0.15)', this.COLORS.diag, 9);
    }

    this.drawHeightLine(ctx, diagMidX - 16, topY, botY);
    this.drawLabel(ctx, `h1=${h1}`, diagMidX - 35, topY + h1 * scale / 2, this.COLORS.labelBgHeight, this.COLORS.height, 9);
    this.drawLabel(ctx, `h2=${h2}`, diagMidX - 35, topY + h1 * scale + h2 * scale / 2, this.COLORS.labelBgHeight, this.COLORS.height, 9);

    this.drawLabel(ctx, `${a}`, (pts[0].x + pts[1].x) / 2, pts[0].y - 12, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);
    this.drawLabel(ctx, `${b}`, (pts[1].x + pts[2].x) / 2 + 28, (pts[1].y + pts[2].y) / 2, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);
    this.drawLabel(ctx, `${c}`, (pts[2].x + pts[3].x) / 2, pts[2].y + 14, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);
    this.drawLabel(ctx, `${d}`, (pts[3].x + pts[0].x) / 2 - 28, (pts[3].y + pts[0].y) / 2, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);

    this.drawLabel(ctx, `Q=${diag}`, (diagLeft + diagRight) / 2, topY + 12, 'rgba(156,39,176,0.15)', '#7b1fa2', 9);

    if (divisions && divisions.length > 0) {
      const spanY = botY - topY;
      const refW = (divisions[0] && divisions[0].a) || diag;
      const wScale = (diagRight - diagLeft) / refW;

      for (let i = 0; i < divisions.length; i++) {
        const div = divisions[i];
        const fracTop = (div.yTop || 0) / totalH;
        const fracBot = (div.yBottom || 0) / totalH;
        const secTopY = topY + fracTop * spanY;
        const secBotY = topY + fracBot * spanY;
        const wTop = div.a * wScale;
        const wBot = div.b * wScale;
        const lx = diagLeft;

        ctx.save();
        ctx.fillStyle = `hsla(${(i * 360 / divisions.length) % 360}, 50%, 95%, 0.5)`;
        ctx.beginPath();
        ctx.moveTo(lx, secTopY);
        ctx.lineTo(lx + wTop, secTopY);
        ctx.lineTo(lx + wBot, secBotY);
        ctx.lineTo(lx, secBotY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = this.COLORS.division;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.restore();

        if (i > 0) {
          ctx.save();
          ctx.strokeStyle = this.COLORS.division;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(lx, secTopY);
          ctx.lineTo(lx + wTop, secTopY);
          ctx.stroke();
          ctx.restore();
        }

        this.drawLabel(ctx, `${i + 1}`, lx + wTop / 2, (secTopY + secBotY) / 2, 'rgba(230,81,0,0.8)', '#fff', 14);
      }
    }

    ctx.save();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Segoe UI, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('الرباعي غير المنتظم', canvasW / 2, 18);
    ctx.restore();
  },

  drawIrregularQuadSection(canvas, section, index) {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const maxCanvasW = Math.min(500, window.innerWidth - 60);
    const maxCanvasH = 350;

    const useStored = section.leftTopX !== undefined;

    let pts;
    if (useStored) {
      const yTop = section.yTop || 0;
      const yBottom = section.yBottom !== undefined ? section.yBottom : (yTop + section.h);
      pts = [
        { x: section.leftTopX, y: yTop },
        { x: section.rightTopX, y: yTop },
        { x: section.rightBotX, y: yBottom },
        { x: section.leftBotX, y: yBottom }
      ];
    } else {
      const secH = section.h;
      const delta = Math.sqrt(Math.max(0, section.c * section.c - secH * secH));
      pts = [
        { x: 0, y: 0 },
        { x: section.a, y: 0 },
        { x: delta + section.b, y: secH },
        { x: delta, y: secH }
      ];
    }

    const minX = Math.min(...pts.map(p => p.x));
    const maxX = Math.max(...pts.map(p => p.x));
    const minY = Math.min(...pts.map(p => p.y));
    const maxY = Math.max(...pts.map(p => p.y));
    const totalW = maxX - minX;
    const secH = maxY - minY;

    const scale = this.getScale(totalW, secH, maxCanvasW, maxCanvasH);

    const canvasW = totalW * scale + 140;
    const canvasH = secH * scale + 100;

    canvas.width = canvasW * dpr;
    canvas.height = canvasH * dpr;
    canvas.style.width = canvasW + 'px';
    canvas.style.height = canvasH + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasW, canvasH);

    const ox = 70 - minX * scale;
    const oy = 30 - minY * scale;

    const dPts = pts.map(p => ({ x: ox + p.x * scale, y: oy + p.y * scale }));

    ctx.fillStyle = `hsla(${((index - 1) * 60) % 360}, 40%, 95%, 0.6)`;
    ctx.beginPath();
    ctx.moveTo(dPts[0].x, dPts[0].y);
    for (let i = 1; i < dPts.length; i++) ctx.lineTo(dPts[i].x, dPts[i].y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = this.COLORS.shape;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dPts[0].x, dPts[0].y);
    for (let i = 1; i < dPts.length; i++) ctx.lineTo(dPts[i].x, dPts[i].y);
    ctx.closePath();
    ctx.stroke();

    this.drawDashedLine(ctx, dPts[0].x, dPts[0].y, dPts[2].x, dPts[2].y, this.COLORS.diag);
    this.drawDashedLine(ctx, dPts[1].x, dPts[1].y, dPts[3].x, dPts[3].y, this.COLORS.diag);

    const hx = dPts[0].x + (dPts[3].x - dPts[0].x) * 0.3;
    this.drawHeightLine(ctx, hx, dPts[0].y, dPts[3].y);
    this.drawLabel(ctx, `h=${section.h}`, hx + 16, (dPts[0].y + dPts[3].y) / 2, this.COLORS.labelBgHeight, this.COLORS.height, 9);

    const botWidth = useStored ? section.c : section.b;
    const rightEdge = useStored ? section.b : section.c;

    this.drawLabel(ctx, `${section.a}`, (dPts[0].x + dPts[1].x) / 2, dPts[0].y - 12, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);
    this.drawLabel(ctx, `${botWidth}`, (dPts[2].x + dPts[3].x) / 2, dPts[3].y + 14, 'rgba(26,107,60,0.15)', this.COLORS.shape, 10);

    const leftMidX = (dPts[0].x + dPts[3].x) / 2 - 22;
    const leftMidY = (dPts[0].y + dPts[3].y) / 2;
    this.drawLabel(ctx, `d=${section.d}`, leftMidX, leftMidY, 'rgba(26,107,60,0.15)', this.COLORS.shape, 9);

    const rightMidX = (dPts[1].x + dPts[2].x) / 2 + 22;
    const rightMidY = (dPts[1].y + dPts[2].y) / 2;
    this.drawLabel(ctx, `c=${rightEdge}`, rightMidX, rightMidY, 'rgba(26,107,60,0.15)', this.COLORS.shape, 9);

    this.drawLabel(ctx, `d1=${section.diag1}`, (dPts[0].x + dPts[2].x) / 2 - 8, (dPts[0].y + dPts[2].y) / 2 - 8, 'rgba(21,101,192,0.15)', this.COLORS.diag, 8);
    this.drawLabel(ctx, `d2=${section.diag2}`, (dPts[1].x + dPts[3].x) / 2 + 8, (dPts[1].y + dPts[3].y) / 2 - 8, 'rgba(21,101,192,0.15)', this.COLORS.diag, 8);

    ctx.save();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 11px Segoe UI, Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`القسم ${index}`, canvasW / 2, 16);
    ctx.restore();
  },

  widthAtHeight(hTotal, a, b, y) {
    return a + (b - a) * (y / hTotal);
  },

  interpolateEdge(edgeTopX, edgeBottomX, hTotal, y) {
    if (hTotal === 0) return edgeTopX;
    return edgeTopX + (edgeBottomX - edgeTopX) * (y / hTotal);
  }
};
