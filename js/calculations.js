const Calculations = {
  FEDDAN: 4200.83,
  QIRAT: 175.034,
  SAH: 7.293,

  toUnits(areaM2) {
    if (areaM2 <= 0) return { m2: 0, feddan: 0, qirat: 0, sah: 0, display: '' };
    const feddan = Math.floor(areaM2 / this.FEDDAN);
    const remainingAfterFeddan = areaM2 - feddan * this.FEDDAN;
    const qirat = Math.floor(remainingAfterFeddan / this.QIRAT);
    const remainingAfterQirat = remainingAfterFeddan - qirat * this.QIRAT;
    const sah = remainingAfterQirat / this.SAH;
    const sahRound = Math.round(sah * 1000) / 1000;
    return {
      m2: Math.round(areaM2 * 1000) / 1000,
      feddan,
      qirat,
      sah: sahRound,
      display: `${feddan} فدان - ${qirat} قيراط - ${sahRound} سهم`
    };
  },

  validatePositive(val, name) {
    if (val === '' || val === null || val === undefined) return `${name} مطلوب`;
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) return `${name} يجب أن يكون أكبر من صفر`;
    return null;
  },

  trapezoidCalc(a, b, c, d) {
    const errors = [];
    const e1 = this.validatePositive(a, 'القاعدة العلوية');
    const e2 = this.validatePositive(b, 'القاعدة السفلية');
    const e3 = this.validatePositive(c, 'الضلع المائل الأيمن');
    const e4 = this.validatePositive(d, 'الضلع المائل الأيسر');
    if (e1) errors.push(e1);
    if (e2) errors.push(e2);
    if (e3) errors.push(e3);
    if (e4) errors.push(e4);
    if (errors.length > 0) return { errors };

    const aN = parseFloat(a), bN = parseFloat(b);
    const cN = parseFloat(c), dN = parseFloat(d);

    const baseDiff = bN - aN;

    let leftTopX, rightOffset;
    if (Math.abs(baseDiff) < 1e-9) {
      leftTopX = 0;
      rightOffset = 0;
    } else {
      leftTopX = (dN * dN - cN * cN + baseDiff * baseDiff) / (2 * baseDiff);
      rightOffset = baseDiff - leftTopX;
    }

    const hSqFromD = dN * dN - leftTopX * leftTopX;
    const hSqFromC = cN * cN - rightOffset * rightOffset;

    const hSq = Math.min(hSqFromD, hSqFromC);
    if (hSq <= 0) {
      return { errors: ['القياسات المدخلة لا تشكل شبه منحرف صحيح. تحقق من طول الأضلاع المائلة والقواعد'] };
    }
    const h = Math.sqrt(hSq);

    const diag1 = Math.sqrt(
      (leftTopX + aN) * (leftTopX + aN) + h * h
    );
    const diag2 = Math.sqrt(
      (bN - leftTopX) * (bN - leftTopX) + h * h
    );
    const perimeter = aN + bN + cN + dN;
    const areaM2 = ((aN + bN) / 2) * h;

    return {
      a: aN, b: bN, c: cN, d: dN,
      h: Math.round(h * 1000) / 1000,
      x1: Math.round(rightOffset * 1000) / 1000,
      x2: Math.round(leftTopX * 1000) / 1000,
      baseDiff: Math.round(baseDiff * 1000) / 1000,
      leftTopX: Math.round(leftTopX * 1000) / 1000,
      leftBottomX: 0,
      areaM2: Math.round(areaM2 * 1000) / 1000,
      diag1: Math.round(diag1 * 1000) / 1000,
      diag2: Math.round(diag2 * 1000) / 1000,
      perimeter: Math.round(perimeter * 1000) / 1000,
      units: this.toUnits(areaM2)
    };
  },

  cyclicQuadCalc(a, b, c, d) {
    const errors = [];
    const vals = [
      { v: a, n: 'الضلع الأول' },
      { v: b, n: 'الضلع الثاني' },
      { v: c, n: 'الضلع الثالث' },
      { v: d, n: 'الضلع الرابع' }
    ];
    for (const { v, n } of vals) {
      const e = this.validatePositive(v, n);
      if (e) errors.push(e);
    }
    if (errors.length > 0) return { errors };

    const aN = parseFloat(a), bN = parseFloat(b);
    const cN = parseFloat(c), dN = parseFloat(d);

    if (aN + cN <= 1e-9 || bN + dN <= 1e-9) {
      return { errors: ['المجموعات المتقابلة من الأضلاع يجب أن يكون مجموعها أكبر من صفر'] };
    }

    const s = (aN + bN + cN + dN) / 2;
    const term = (s - aN) * (s - bN) * (s - cN) * (s - dN);

    if (term < 0) {
      return { errors: ['الأضلاع المدخلة لا تشكل رباعياً دائرياً صالحاً'] };
    }

    const areaM2 = Math.sqrt(term);
    const diag1 = Math.sqrt(((aN * cN + bN * dN) * (aN * dN + bN * cN)) / (aN * bN + cN * dN));
    const diag2 = Math.sqrt(((aN * cN + bN * dN) * (aN * bN + cN * dN)) / (aN * dN + bN * cN));
    const h = areaM2 / ((aN + cN) / 2);
    const perimeter = aN + bN + cN + dN;

    return {
      a: aN, b: bN, c: cN, d: dN,
      h: Math.round(h * 1000) / 1000,
      areaM2: Math.round(areaM2 * 1000) / 1000,
      diag1: Math.round(diag1 * 1000) / 1000,
      diag2: Math.round(diag2 * 1000) / 1000,
      perimeter: Math.round(perimeter * 1000) / 1000,
      units: this.toUnits(areaM2)
    };
  },

  irregularQuadCalc(a, b, c, d, diag) {
    const errors = [];
    const vals = [
      { v: a, n: 'الضلع الأول' }, { v: b, n: 'الضلع الثاني' },
      { v: c, n: 'الضلع الثالث' }, { v: d, n: 'الضلع الرابع' },
      { v: diag, n: 'القطر' }
    ];
    for (const { v, n } of vals) {
      const e = this.validatePositive(v, n);
      if (e) errors.push(e);
    }
    if (errors.length > 0) return { errors };

    const aN = parseFloat(a), bN = parseFloat(b);
    const cN = parseFloat(c), dN = parseFloat(d);
    const diagN = parseFloat(diag);

    const s1 = (aN + bN + diagN) / 2;
    const s2 = (cN + dN + diagN) / 2;

    const t1 = s1 * (s1 - aN) * (s1 - bN) * (s1 - diagN);
    const t2 = s2 * (s2 - cN) * (s2 - dN) * (s2 - diagN);

    if (t1 < 0 || t2 < 0) {
      return { errors: ['القياسات المدخلة لا تشكل رباعياً غير منتظم صالح. تحقق من طول الأضلاع والقطر'] };
    }

    const area1 = Math.sqrt(t1);
    const area2 = Math.sqrt(t2);
    const areaM2 = area1 + area2;
    const h1 = (2 * area1) / diagN;
    const h2 = (2 * area2) / diagN;
    const perimeter = aN + bN + cN + dN;

    const cosA = (dN * dN + cN * cN - diagN * diagN) / (2 * dN * cN);
    const diag2Sq = aN * aN + dN * dN - 2 * aN * dN * Math.max(-1, Math.min(1, cosA));
    const diag2 = diag2Sq > 0 ? Math.sqrt(diag2Sq) : 0;

    return {
      a: aN, b: bN, c: cN, d: dN,
      diag: diagN,
      h1: Math.round(h1 * 1000) / 1000,
      h2: Math.round(h2 * 1000) / 1000,
      diag2: Math.round(diag2 * 1000) / 1000,
      area1: Math.round(area1 * 1000) / 1000,
      area2: Math.round(area2 * 1000) / 1000,
      areaM2: Math.round(areaM2 * 1000) / 1000,
      perimeter: Math.round(perimeter * 1000) / 1000,
      units: this.toUnits(areaM2)
    };
  },

  calcHeightTrapezoid(a, b, c, d) {
    const errors = [];
    const vals = [
      { v: a, n: 'القاعدة العلوية' }, { v: b, n: 'القاعدة السفلية' },
      { v: c, n: 'الضلع المائل الأيمن' }, { v: d, n: 'الضلع المائل الأيسر' }
    ];
    for (const { v, n } of vals) {
      const e = this.validatePositive(v, n);
      if (e) errors.push(e);
    }
    if (errors.length > 0) return { errors };

    return this.trapezoidCalc(a, b, c, d);
  },

  calcHeightCyclic(a, b, c, d) {
    return this.cyclicQuadCalc(a, b, c, d);
  },

  calcHeightIrregular(a, b, c, d, diag, h1, h2) {
    const errors = [];
    if (diag !== undefined && diag !== null && diag !== '') {
      return this.irregularQuadCalc(a, b, c, d, diag);
    }

    const vals = [
      { v: a, n: 'الضلع الأول' }, { v: b, n: 'الضلع الثاني' },
      { v: c, n: 'الضلع الثالث' }, { v: d, n: 'الضلع الرابع' },
      { v: h1, n: 'الارتفاع الأول' }, { v: h2, n: 'الارتفاع الثاني' }
    ];
    for (const { v, n } of vals) {
      const e = this.validatePositive(v, n);
      if (e) errors.push(e);
    }
    if (errors.length > 0) return { errors };

    const aN = parseFloat(a), bN = parseFloat(b);
    const cN = parseFloat(c), dN = parseFloat(d);
    const h1N = parseFloat(h1), h2N = parseFloat(h2);

    const diagSq1 = aN * aN - h1N * h1N;
    const diagSq2 = dN * dN - h2N * h2N;
    if (diagSq1 < 0 || diagSq2 < 0) {
      return { errors: ['الارتفاعات غير متوافقة مع الأضلاع'] };
    }

    const areaM2 = (h1N + h2N) * Math.sqrt(aN * aN - h1N * h1N) / 2 + (h1N + h2N) * Math.sqrt(dN * dN - h2N * h2N) / 2;
    const perimeter = aN + bN + cN + dN;

    return {
      a: aN, b: bN, c: cN, d: dN,
      h1: h1N, h2: h2N,
      areaM2: Math.round(areaM2 * 1000) / 1000,
      perimeter: Math.round(perimeter * 1000) / 1000,
      units: this.toUnits(areaM2)
    };
  },

  widthAtHeight(hTotal, a, b, y) {
    return a + (b - a) * (y / hTotal);
  },

  interpolateEdge(edgeTopX, edgeBottomX, hTotal, y) {
    if (hTotal === 0) return edgeTopX;
    return edgeTopX + (edgeBottomX - edgeTopX) * (y / hTotal);
  },

  divideEqualTrapezoid(a, b, c, d, n) {
    const result = this.trapezoidCalc(a, b, c, d);
    if (result.errors) return result;

    const { h, areaM2, diag1, diag2, leftTopX } = result;
    const leftBottomX = 0;
    const secArea = areaM2 / n;
    const k = (b - a) / (2 * h);

    const sections = [];
    let cumY = 0;

    for (let i = 0; i < n; i++) {
      const targetArea = (i + 1) * secArea;
      let yBottom;
      if (Math.abs(k) < 1e-9) {
        yBottom = targetArea / a;
      } else {
        yBottom = (-a + Math.sqrt(a * a + 4 * k * targetArea)) / (2 * k);
      }
      yBottom = Math.min(yBottom, h);
      const yTop = cumY;
      const secH = yBottom - yTop;

      const wTop = this.widthAtHeight(h, a, b, yTop);
      const wBottom = this.widthAtHeight(h, a, b, yBottom);

      const leftTopXPos = this.interpolateEdge(leftTopX, leftBottomX, h, yTop);
      const leftBottomXPos = this.interpolateEdge(leftTopX, leftBottomX, h, yBottom);
      const rightTopXPos = leftTopXPos + wTop;
      const rightBottomXPos = leftBottomXPos + wBottom;

      const secA = wTop;
      const secB = wBottom;
      const secC = Math.sqrt(secH * secH + Math.pow(rightBottomXPos - rightTopXPos, 2));
      const secD = Math.sqrt(secH * secH + Math.pow(leftBottomXPos - leftTopXPos, 2));

      const secAreaCalc = ((secA + secB) / 2) * secH;
      const secX1 = rightBottomXPos - rightTopXPos;
      const secX2 = leftBottomXPos - leftTopXPos;
      const secHsq = secC * secC - secX1 * secX1;
      const secHval = secHsq > 0 ? Math.sqrt(secHsq) : secH;

      const secDiag1 = Math.sqrt(secA * secA + secX2 * secX2 + secHval * secHval);
      const secDiag2 = Math.sqrt(secB * secB + secX1 * secX1 + secHval * secHval);

      sections.push({
        index: i + 1,
        a: Math.round(secA * 1000) / 1000,
        b: Math.round(secB * 1000) / 1000,
        c: Math.round(secC * 1000) / 1000,
        d: Math.round(secD * 1000) / 1000,
        h: Math.round(secHval * 1000) / 1000,
        areaM2: Math.round(secAreaCalc * 1000) / 1000,
        diag1: Math.round(secDiag1 * 1000) / 1000,
        diag2: Math.round(secDiag2 * 1000) / 1000,
        units: this.toUnits(secAreaCalc),
        leftTopX: leftTopXPos,
        leftBottomX: leftBottomXPos,
        rightTopX: rightTopXPos,
        rightBottomX: rightBottomXPos,
        yTop, yBottom
      });

      cumY = yBottom;
    }

    return { original: result, sections };
  },

  divideByAreaTrapezoid(a, b, c, d, targetAreas) {
    const result = this.trapezoidCalc(a, b, c, d);
    if (result.errors) return result;

    const { h, x1, x2, areaM2 } = result;
    const totalInput = targetAreas.reduce((s, v) => s + v, 0);

    if (Math.abs(totalInput - areaM2) > 0.001) {
      return {
        errors: [
          `مجموع المساحات المدخلة (${Math.round(totalInput * 1000) / 1000} م²) لا يساوي المساحة الكلية (${areaM2} م²)`,
          `المتبقي: ${Math.round((areaM2 - totalInput) * 1000) / 1000} م²`
        ]
      };
    }

    const leftBottomX = 0;
    const leftTopX = result.leftTopX;

    const sections = [];
    let cumH = 0;
    const sectionHs = [];

    for (let i = 0; i < targetAreas.length; i++) {
      const wAtCumH = this.widthAtHeight(h, a, b, cumH);
      const disc = wAtCumH * wAtCumH + 2 * targetAreas[i] * (b - a) / h;

      if (disc < 0) {
        return { errors: [`لا يمكن إنشاء القسم ${i + 1} بالمساحة المطلوبة`] };
      }

      const secH = (-wAtCumH + Math.sqrt(disc)) / ((b - a) / h);
      sectionHs.push(secH);
      cumH += secH;
    }

    for (let i = 0; i < targetAreas.length; i++) {
      const yTop = sectionHs.slice(0, i).reduce((s, v) => s + v, 0);
      const yBottom = yTop + sectionHs[i];
      const secH = sectionHs[i];

      const wTop = this.widthAtHeight(h, a, b, yTop);
      const wBottom = this.widthAtHeight(h, a, b, yBottom);

      const leftTopXPos = this.interpolateEdge(leftTopX, leftBottomX, h, yTop);
      const leftBottomXPos = this.interpolateEdge(leftTopX, leftBottomX, h, yBottom);
      const rightTopXPos = leftTopXPos + wTop;
      const rightBottomXPos = leftBottomXPos + wBottom;

      const secA = wTop;
      const secB = wBottom;
      const secC = Math.sqrt(secH * secH + Math.pow(rightBottomXPos - rightTopXPos, 2));
      const secD = Math.sqrt(secH * secH + Math.pow(leftBottomXPos - leftTopXPos, 2));

      const secArea = targetAreas[i];
      const secDiag1 = Math.sqrt(secA * secA + Math.pow(leftBottomXPos - leftTopXPos, 2) + secH * secH);
      const secDiag2 = Math.sqrt(secB * secB + Math.pow(rightBottomXPos - rightTopXPos, 2) + secH * secH);

      sections.push({
        index: i + 1,
        a: Math.round(secA * 1000) / 1000,
        b: Math.round(secB * 1000) / 1000,
        c: Math.round(secC * 1000) / 1000,
        d: Math.round(secD * 1000) / 1000,
        h: Math.round(secH * 1000) / 1000,
        areaM2: Math.round(secArea * 1000) / 1000,
        diag1: Math.round(secDiag1 * 1000) / 1000,
        diag2: Math.round(secDiag2 * 1000) / 1000,
        units: this.toUnits(secArea),
        leftTopX: leftTopXPos,
        leftBottomX: leftBottomXPos,
        rightTopX: rightTopXPos,
        rightBottomX: rightBottomXPos,
        yTop, yBottom
      });
    }

    return { original: result, sections };
  },

  divideBySlantTrapezoid(a, b, c, d, slants) {
    const result = this.trapezoidCalc(a, b, c, d);
    if (result.errors) return result;

    const { h } = result;
    const leftBottomX = 0;
    const leftTopX = result.leftTopX;

    const sections = [];
    let cumH = 0;

    for (let i = 0; i < slants.length; i++) {
      const { ci, di } = slants[i];
      const secH = ci * h / c;

      const yTop = cumH;
      const yBottom = cumH + secH;

      if (yBottom > h + 0.01) {
        return { errors: [`القسم ${i + 1}: مجموع الارتفاعات (${Math.round(yBottom * 1000) / 1000} م) يتجاوز الارتفاع الكلي (${h} م)`] };
      }

      const wTop = this.widthAtHeight(h, a, b, yTop);
      const wBottom = this.widthAtHeight(h, a, b, yBottom);

      const leftTopXPos = this.interpolateEdge(leftTopX, leftBottomX, h, yTop);
      const leftBottomXPos = this.interpolateEdge(leftTopX, leftBottomX, h, yBottom);
      const rightTopXPos = leftTopXPos + wTop;
      const rightBottomXPos = leftBottomXPos + wBottom;

      const secA = wTop;
      const secB = wBottom;

      const secArea = ((secA + secB) / 2) * secH;
      const secDiag1 = Math.sqrt(secA * secA + Math.pow(leftBottomXPos - leftTopXPos, 2) + secH * secH);
      const secDiag2 = Math.sqrt(secB * secB + Math.pow(rightBottomXPos - rightTopXPos, 2) + secH * secH);

      sections.push({
        index: i + 1,
        inputCi: ci,
        inputDi: di,
        a: Math.round(secA * 1000) / 1000,
        b: Math.round(secB * 1000) / 1000,
        c: ci,
        d: di,
        h: Math.round(secH * 1000) / 1000,
        areaM2: Math.round(secArea * 1000) / 1000,
        diag1: Math.round(secDiag1 * 1000) / 1000,
        diag2: Math.round(secDiag2 * 1000) / 1000,
        units: this.toUnits(secArea),
        leftTopX: leftTopXPos,
        leftBottomX: leftBottomXPos,
        rightTopX: rightTopXPos,
        rightBottomX: rightBottomXPos,
        yTop, yBottom
      });

      cumH += secH;
    }

    return { original: result, sections };
  },

  divideEqualCyclic(a, b, c, d, n) {
    const result = this.cyclicQuadCalc(a, b, c, d);
    if (result.errors) return result;

    const { areaM2, h, diag1 } = result;
    const secArea = areaM2 / n;
    const k = (c - a) / (2 * h);

    const sections = [];
    let cumY = 0;

    for (let i = 0; i < n; i++) {
      const targetArea = (i + 1) * secArea;
      let yBottom;
      if (Math.abs(k) < 1e-9) {
        yBottom = targetArea / a;
      } else {
        yBottom = (-a + Math.sqrt(a * a + 4 * k * targetArea)) / (2 * k);
      }
      yBottom = Math.min(yBottom, h);
      const yTop = cumY;
      const secH = yBottom - yTop;

      const wTop = this.widthAtHeight(h, a, c, yTop);
      const wBottom = this.widthAtHeight(h, a, c, yBottom);
      const secAreaCalc = ((wTop + wBottom) / 2) * secH;
      const secDiag = diag1 * secH / h;

      sections.push({
        index: i + 1,
        a: Math.round(wTop * 1000) / 1000,
        b: Math.round(wBottom * 1000) / 1000,
        c: Math.round(secDiag * 1000) / 1000,
        d: Math.round(secDiag * 1000) / 1000,
        h: Math.round(secH * 1000) / 1000,
        areaM2: Math.round(secAreaCalc * 1000) / 1000,
        diag1: Math.round(secDiag * 1000) / 1000,
        diag2: Math.round(secDiag * 1000) / 1000,
        units: this.toUnits(secAreaCalc),
        yTop, yBottom
      });

      cumY = yBottom;
    }

    return { original: result, sections };
  },

  divideByAreaCyclic(a, b, c, d, targetAreas) {
    const result = this.cyclicQuadCalc(a, b, c, d);
    if (result.errors) return result;

    const { areaM2, h, diag1 } = result;
    const totalInput = targetAreas.reduce((s, v) => s + v, 0);

    if (Math.abs(totalInput - areaM2) > 0.001) {
      return {
        errors: [
          `مجموع المساحات المدخلة (${Math.round(totalInput * 1000) / 1000} م²) لا يساوي المساحة الكلية (${areaM2} م²)`,
          `المتبقي: ${Math.round((areaM2 - totalInput) * 1000) / 1000} م²`
        ]
      };
    }

    const sectionHs = [];
    let cumH = 0;
    for (let i = 0; i < targetAreas.length; i++) {
      const wAtCumH = this.widthAtHeight(h, a, c, cumH);
      const wDiff = (c - a) / h;
      const disc = wAtCumH * wAtCumH + 2 * targetAreas[i] * wDiff;
      if (disc < 0) {
        return { errors: [`لا يمكن إنشاء القسم ${i + 1} بالمساحة المطلوبة`] };
      }
      const secH = (-wAtCumH + Math.sqrt(disc)) / wDiff;
      sectionHs.push(secH);
      cumH += secH;
    }

    const sections = [];
    for (let i = 0; i < targetAreas.length; i++) {
      const yTop = sectionHs.slice(0, i).reduce((s, v) => s + v, 0);
      const yBottom = yTop + sectionHs[i];
      const secH = sectionHs[i];

      const wTop = this.widthAtHeight(h, a, c, yTop);
      const wBottom = this.widthAtHeight(h, a, c, yBottom);
      const secDiag = diag1 * secH / h;

      sections.push({
        index: i + 1,
        a: Math.round(wTop * 1000) / 1000,
        b: Math.round(wBottom * 1000) / 1000,
        c: Math.round(secDiag * 1000) / 1000,
        d: Math.round(secDiag * 1000) / 1000,
        h: Math.round(secH * 1000) / 1000,
        areaM2: Math.round(targetAreas[i] * 1000) / 1000,
        diag1: Math.round(secDiag * 1000) / 1000,
        diag2: Math.round(secDiag * 1000) / 1000,
        units: this.toUnits(targetAreas[i]),
        yTop, yBottom
      });
    }

    return { original: result, sections };
  },

  divideBySlantCyclic(a, b, c, d, slants) {
    const result = this.cyclicQuadCalc(a, b, c, d);
    if (result.errors) return result;

    const { h, diag1 } = result;
    const sections = [];
    let cumH = 0;

    for (let i = 0; i < slants.length; i++) {
      const { ci, di } = slants[i];
      const secH = ci * h / b;

      const yTop = cumH;
      const yBottom = cumH + secH;

      if (yBottom > h + 0.01) {
        return { errors: [`القسم ${i + 1}: مجموع الارتفاعات (${Math.round(yBottom * 1000) / 1000} م) يتجاوز الارتفاع الكلي (${h} م)`] };
      }

      const wTop = this.widthAtHeight(h, a, c, yTop);
      const wBottom = this.widthAtHeight(h, a, c, yBottom);
      const secArea = ((wTop + wBottom) / 2) * secH;
      const secDiag = diag1 * secH / h;

      sections.push({
        index: i + 1,
        inputCi: ci,
        inputDi: di,
        a: Math.round(wTop * 1000) / 1000,
        b: Math.round(wBottom * 1000) / 1000,
        c: ci,
        d: di,
        h: Math.round(secH * 1000) / 1000,
        areaM2: Math.round(secArea * 1000) / 1000,
        diag1: Math.round(secDiag * 1000) / 1000,
        diag2: Math.round(secDiag * 1000) / 1000,
        units: this.toUnits(secArea),
        yTop, yBottom
      });

      cumH += secH;
    }

    return { original: result, sections };
  },

  divideEqualIrregular(a, b, c, d, diag, n) {
    const result = this.irregularQuadCalc(a, b, c, d, diag);
    if (result.errors) return result;

    const { areaM2, h1, h2, diag: diagN } = result;
    const totalH = h1 + h2;
    const secArea = areaM2 / n;
    const A_coeff = diagN / (2 * totalH);

    const sections = [];
    let cumY = 0;

    for (let i = 0; i < n; i++) {
      const targetArea = (i + 1) * secArea;
      let yBottom;
      if (Math.abs(A_coeff) < 1e-9) {
        yBottom = targetArea / diagN;
      } else {
        const disc = diagN * diagN - 4 * A_coeff * targetArea;
        yBottom = (diagN - Math.sqrt(Math.max(0, disc))) / (2 * A_coeff);
      }
      yBottom = Math.min(yBottom, totalH);
      const yTop = cumY;
      const secH = yBottom - yTop;

      const fracTop = yTop / totalH;
      const fracBottom = yBottom / totalH;
      const wTop = diagN * (1 - fracTop);
      const wBottom = diagN * (1 - fracBottom);
      const secAreaCalc = ((wTop + wBottom) / 2) * secH;
      const secDiag = diagN * secH / totalH;
      const secH1 = h1 * secH / totalH;
      const secH2 = h2 * secH / totalH;

      sections.push({
        index: i + 1,
        a: Math.round(wTop * 1000) / 1000,
        b: Math.round(wBottom * 1000) / 1000,
        c: Math.round(secDiag * 1000) / 1000,
        d: Math.round(secDiag * 1000) / 1000,
        h: Math.round(secH * 1000) / 1000,
        areaM2: Math.round(secAreaCalc * 1000) / 1000,
        diag1: Math.round(secDiag * 1000) / 1000,
        diag2: Math.round(secDiag * 1000) / 1000,
        h1: Math.round(secH1 * 1000) / 1000,
        h2: Math.round(secH2 * 1000) / 1000,
        units: this.toUnits(secAreaCalc),
        yTop, yBottom
      });

      cumY = yBottom;
    }

    return { original: result, sections };
  },

  divideByAreaIrregular(a, b, c, d, diag, targetAreas) {
    const result = this.irregularQuadCalc(a, b, c, d, diag);
    if (result.errors) return result;

    const { areaM2, h1, h2, diag: diagN } = result;
    const totalH = h1 + h2;
    const totalInput = targetAreas.reduce((s, v) => s + v, 0);

    if (Math.abs(totalInput - areaM2) > 0.001) {
      return {
        errors: [
          `مجموع المساحات المدخلة (${Math.round(totalInput * 1000) / 1000} م²) لا يساوي المساحة الكلية (${areaM2} م²)`,
          `المتبقي: ${Math.round((areaM2 - totalInput) * 1000) / 1000} م²`
        ]
      };
    }

    const sectionHs = [];
    let cumH = 0;

    for (let i = 0; i < targetAreas.length; i++) {
      const fracCum = cumH / totalH;
      const wAtCumH = diagN * (1 - fracCum);
      const slope = -diagN / totalH;

      const disc = wAtCumH * wAtCumH + 2 * targetAreas[i] * slope;
      if (disc < 0) {
        return { errors: [`لا يمكن إنشاء القسم ${i + 1} بالمساحة المطلوبة`] };
      }

      const secH = (-wAtCumH + Math.sqrt(disc)) / slope;
      sectionHs.push(secH);
      cumH += secH;
    }

    const sections = [];
    for (let i = 0; i < targetAreas.length; i++) {
      const yTop = sectionHs.slice(0, i).reduce((s, v) => s + v, 0);
      const yBottom = yTop + sectionHs[i];
      const secH = sectionHs[i];

      const fracTop = yTop / totalH;
      const fracBottom = yBottom / totalH;
      const wTop = diagN * (1 - fracTop);
      const wBottom = diagN * (1 - fracBottom);

      const secH1 = h1 * secH / totalH;
      const secH2 = h2 * secH / totalH;
      const secDiag = diagN * secH / totalH;

      sections.push({
        index: i + 1,
        a: Math.round(wTop * 1000) / 1000,
        b: Math.round(wBottom * 1000) / 1000,
        c: Math.round(secDiag * 1000) / 1000,
        d: Math.round(secDiag * 1000) / 1000,
        h: Math.round(secH * 1000) / 1000,
        areaM2: Math.round(targetAreas[i] * 1000) / 1000,
        diag1: Math.round(secDiag * 1000) / 1000,
        diag2: Math.round(secDiag * 1000) / 1000,
        h1: Math.round(secH1 * 1000) / 1000,
        h2: Math.round(secH2 * 1000) / 1000,
        units: this.toUnits(targetAreas[i]),
        yTop, yBottom
      });
    }

    return { original: result, sections };
  },

  divideBySlantIrregular(a, b, c, d, diag, slants) {
    const result = this.irregularQuadCalc(a, b, c, d, diag);
    if (result.errors) return result;

    const { areaM2, h1, h2, diag: diagN } = result;
    const totalH = h1 + h2;
    const sections = [];
    let cumH = 0;

    for (let i = 0; i < slants.length; i++) {
      const { ci, di } = slants[i];
      const secH = ci * totalH / b;

      const yTop = cumH;
      const yBottom = cumH + secH;

      if (yBottom > totalH + 0.01) {
        return { errors: [`القسم ${i + 1}: مجموع الارتفاعات (${Math.round(yBottom * 1000) / 1000} م) يتجاوز الارتفاع الكلي (${Math.round(totalH * 1000) / 1000} م)`] };
      }

      const fracTop = yTop / totalH;
      const fracBottom = yBottom / totalH;
      const wTop = diagN * (1 - fracTop);
      const wBottom = diagN * (1 - fracBottom);

      const secArea = ((wTop + wBottom) / 2) * secH;
      const secH1 = h1 * secH / totalH;
      const secH2 = h2 * secH / totalH;
      const secDiag = diagN * secH / totalH;

      sections.push({
        index: i + 1,
        inputCi: ci,
        inputDi: di,
        a: Math.round(wTop * 1000) / 1000,
        b: Math.round(wBottom * 1000) / 1000,
        c: ci,
        d: di,
        h: Math.round(secH * 1000) / 1000,
        areaM2: Math.round(secArea * 1000) / 1000,
        diag1: Math.round(secDiag * 1000) / 1000,
        diag2: Math.round(secDiag * 1000) / 1000,
        h1: Math.round(secH1 * 1000) / 1000,
        h2: Math.round(secH2 * 1000) / 1000,
        units: this.toUnits(secArea),
        yTop, yBottom
      });

      cumH += secH;
    }

    return { original: result, sections };
  },

  divideBySlantCyclicAC(a, b, c, d, sections_input) {
    const result = this.cyclicQuadCalc(a, b, c, d);
    if (result.errors) return result;

    const { h, diag1, diag2, areaM2 } = result;
    const sections = [];
    let cumH = 0;

    for (let i = 0; i < sections_input.length; i++) {
      const ai = sections_input[i].ai;
      const ci_val = sections_input[i].ci;

      if (a === c) {
        return { errors: ['لا يمكن التقسيم أفقياً عندما تكون القاعدتان متساويتين (a = c)'] };
      }

      const secH = (ai - ci_val) * h / (a - c);
      if (secH <= 0) {
        return { errors: [`القسم ${i + 1}: الارتفاع المحسوب (${Math.round(secH * 1000) / 1000} م) يجب أن يكون أكبر من صفر. تحقق من قيم العرض`] };
      }

      const yTop = cumH;
      const yBottom = cumH + secH;

      if (yBottom > h + 0.01) {
        return { errors: [`القسم ${i + 1}: مجموع الارتفاعات (${Math.round(yBottom * 1000) / 1000} م) يتجاوز الارتفاع الكلي (${h} م)`] };
      }

      const fracTop = yTop / h;
      const fracBottom = yBottom / h;

      const leftTopX = fracTop * (c - a);
      const leftBotX = fracBottom * (c - a);
      const rightTopX = a + leftTopX;
      const rightBotX = c + leftBotX;

      const secB = Math.sqrt(secH * secH + Math.pow(rightBotX - rightTopX, 2));
      const secD_val = Math.sqrt(secH * secH + Math.pow(leftBotX - leftTopX, 2));
      const secArea = ((ai + ci_val) / 2) * secH;

      const secDiag1 = Math.sqrt(
        Math.pow(leftBotX - rightTopX, 2) + secH * secH
      );
      const secDiag2 = Math.sqrt(
        Math.pow(rightBotX - leftTopX, 2) + secH * secH
      );

      sections.push({
        index: i + 1,
        a: Math.round(ai * 1000) / 1000,
        b: Math.round(secB * 1000) / 1000,
        c: Math.round(ci_val * 1000) / 1000,
        d: Math.round(secD_val * 1000) / 1000,
        h: Math.round(secH * 1000) / 1000,
        areaM2: Math.round(secArea * 1000) / 1000,
        diag1: Math.round(secDiag1 * 1000) / 1000,
        diag2: Math.round(secDiag2 * 1000) / 1000,
        units: this.toUnits(secArea),
        leftTopX, leftBotX, rightTopX, rightBotX,
        yTop, yBottom
      });

      cumH += secH;
    }

    return { original: result, sections };
  },

  divideBySlantIrregularAC(a, b, c, d, diag, sections_input) {
    const result = this.irregularQuadCalc(a, b, c, d, diag);
    if (result.errors) return result;

    const { h1, h2, diag: diagN } = result;
    const totalH = h1 + h2;
    const sections = [];
    let cumH = 0;

    for (let i = 0; i < sections_input.length; i++) {
      const ai = sections_input[i].ai;
      const ci_val = sections_input[i].ci;

      if (a === c) {
        return { errors: ['لا يمكن التقسيم أفقياً عندما تكون القاعدتان متساويتين (a = c)'] };
      }

      const secH = (ai - ci_val) * totalH / (a - c);
      if (secH <= 0) {
        return { errors: [`القسم ${i + 1}: الارتفاع المحسوب (${Math.round(secH * 1000) / 1000} م) يجب أن يكون أكبر من صفر. تحقق من قيم العرض`] };
      }

      const yTop = cumH;
      const yBottom = cumH + secH;

      if (yBottom > totalH + 0.01) {
        return { errors: [`القسم ${i + 1}: مجموع الارتفاعات (${Math.round(yBottom * 1000) / 1000} م) يتجاوز الارتفاع الكلي (${Math.round(totalH * 1000) / 1000} م)`] };
      }

      const fracTop = yTop / totalH;
      const fracBottom = yBottom / totalH;

      const leftTopX = fracTop * (d - a);
      const leftBotX = fracBottom * (d - a);
      const rightTopX = a + fracTop * (b - a);
      const rightBotX = a + fracBottom * (b - a);

      const secB = Math.sqrt(secH * secH + Math.pow(rightBotX - rightTopX, 2));
      const secD_val = Math.sqrt(secH * secH + Math.pow(leftBotX - leftTopX, 2));
      const secArea = ((ai + ci_val) / 2) * secH;

      const secDiag1 = Math.sqrt(
        Math.pow(leftBotX - rightTopX, 2) + secH * secH
      );
      const secDiag2 = Math.sqrt(
        Math.pow(rightBotX - leftTopX, 2) + secH * secH
      );

      const secH1 = h1 * secH / totalH;
      const secH2 = h2 * secH / totalH;

      sections.push({
        index: i + 1,
        a: Math.round(ai * 1000) / 1000,
        b: Math.round(secB * 1000) / 1000,
        c: Math.round(ci_val * 1000) / 1000,
        d: Math.round(secD_val * 1000) / 1000,
        h: Math.round(secH * 1000) / 1000,
        areaM2: Math.round(secArea * 1000) / 1000,
        diag1: Math.round(secDiag1 * 1000) / 1000,
        diag2: Math.round(secDiag2 * 1000) / 1000,
        h1: Math.round(secH1 * 1000) / 1000,
        h2: Math.round(secH2 * 1000) / 1000,
        units: this.toUnits(secArea),
        leftTopX, leftBotX, rightTopX, rightBotX,
        yTop, yBottom
      });

      cumH += secH;
    }

    return { original: result, sections };
  }
};
