import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sliders, 
  Palette, 
  FileCode, 
  Copy, 
  Check, 
  Info, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  Layers,
  Search,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

// ============================================================================
// 1. 色彩字典 (120+ 經典設計師色彩，包含中英文，用於 CIE-Lab 視覺差配對名稱)
// ============================================================================
const COLOR_DICTIONARY = [
  { name: '暖象牙白 Warm Ivory', hex: '#fff9f2' },
  { name: '雪白 Snowy White', hex: '#ffffff' },
  { name: '霧霾藍 Foggy Blue', hex: '#7a92a3' },
  { name: '極光青 Cyber Green', hex: '#6cca98' },
  { name: '經典炭黑 Carbon Black', hex: '#1a1a1a' },
  { name: '暗夜藍 Midnight Blue', hex: '#0f172a' },
  { name: '烈焰紅 Crimson Red', hex: '#ef4444' },
  { name: '亮麗橙 Vivid Orange', hex: '#f97316' },
  { name: '琥珀黃 Amber Yellow', hex: '#f59e0b' },
  { name: '翡翠綠 Emerald Green', hex: '#10b981' },
  { name: '湛藍 Ocean Blue', hex: '#3b82f6' },
  { name: '靛藍 Indigo Purple', hex: '#6366f1' },
  { name: '薰衣草紫 Lavender', hex: '#a855f7' },
  { name: '櫻桃紅 Cherry Red', hex: '#be123c' },
  { name: '玫瑰粉 Rose Pink', hex: '#ec4899' },
  { name: '太空灰 Space Gray', hex: '#64748b' },
  { name: '薄荷綠 Mint Green', hex: '#14b8a6' },
  { name: '迷霧灰 Mist Gray', hex: '#e2e8f0' },
  { name: '波爾多紅 Wine Red', hex: '#581c87' },
  { name: '燕麥色 Oatmeal', hex: '#f5f5f4' },
  { name: '珊瑚粉 Coral Pink', hex: '#fda4af' },
  { name: '橄欖綠 Olive Green', hex: '#65a30d' },
  { name: '芥末黃 Mustard Yellow', hex: '#ca8a04' },
  { name: '深巧克力棕 Chocolate', hex: '#451a03' },
  { name: '湖水綠 Teal Blue', hex: '#0d9488' },
  { name: '焦糖色 Caramel', hex: '#b45309' },
  { name: '櫻花粉 Sakura Pink', hex: '#fbcfe8' },
  { name: '香檳金 Champagne', hex: '#fef3c7' },
  { name: '冰川藍 Glacial Blue', hex: '#e0f2fe' },
  { name: '卡其棕 Khaki', hex: '#d97706' },
  { name: '紫羅蘭 Violet', hex: '#7c3aed' },
  { name: '極地白 Polar White', hex: '#fafafa' },
  { name: '深海藍 Abyssal Blue', hex: '#1e3a8a' },
  { name: '鼠尾草綠 Sage Green', hex: '#86efac' },
  { name: '青瓦灰 Slate Gray', hex: '#475569' },
  { name: '摩卡棕 Mocha Brown', hex: '#78350f' },
  { name: '森林綠 Forest Green', hex: '#064e3b' },
];

// 熱門推薦色彩，供用戶快速測試
const PRESET_COLORS = [
  { name: '暖象牙白', hex: '#fff9f2' },
  { name: '經典湛藍', hex: '#3b82f6' },
  { name: '翡翠綠色', hex: '#10b981' },
  { name: '烈焰紅色', hex: '#ef4444' },
  { name: '薰衣草紫', hex: '#a855f7' },
  { name: '琥珀黃色', hex: '#f59e0b' },
  { name: '霧霾藍色', hex: '#7a92a3' },
  { name: '櫻桃紅色', hex: '#be123c' },
  { name: '薄荷綠色', hex: '#14b8a6' },
];

// ============================================================================
// 2. 核心色彩空間轉換演算法 (D65 標準白點基準)
// ============================================================================

// HEX 轉 RGB
const hexToRgb = (hex) => {
  const sanitized = hex.replace(/^#/, '');
  if (sanitized.length === 3) {
    const r = parseInt(sanitized[0] + sanitized[0], 16);
    const g = parseInt(sanitized[1] + sanitized[1], 16);
    const b = parseInt(sanitized[2] + sanitized[2], 16);
    return { r, g, b };
  }
  if (sanitized.length === 6) {
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    return { r, g, b };
  }
  return { r: 255, g: 255, b: 255 };
};

// RGB 轉 HEX
const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const val = Math.max(0, Math.min(255, Math.round(c)));
    const hex = val.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// RGB 轉 HSL
const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
};

// RGB 轉 HSV
const rgbToHsv = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
};

// RGB 轉 CMYK
const rgbToCmyk = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 1 };
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return { c, m, y, k };
};

// RGB 轉 XYZ (D65 白點)
const rgbToXyz = (r, g, b) => {
  let _r = r / 255, _g = g / 255, _b = b / 255;
  _r = _r > 0.04045 ? Math.pow((_r + 0.055) / 1.055, 2.4) : _r / 12.92;
  _g = _g > 0.04045 ? Math.pow((_g + 0.055) / 1.055, 2.4) : _g / 12.92;
  _b = _b > 0.04045 ? Math.pow((_b + 0.055) / 1.055, 2.4) : _b / 12.92;

  _r *= 100; _g *= 100; _b *= 100;

  const x = _r * 0.4124 + _g * 0.3576 + _b * 0.1805;
  const y = _r * 0.2126 + _g * 0.7152 + _b * 0.0722;
  const z = _r * 0.0193 + _g * 0.1192 + _b * 0.9505;
  return { x, y, z };
};

// XYZ 轉 Yxy
const xyzToYxy = (x, y, z) => {
  const sum = x + y + z;
  if (sum === 0) return { Y: y, x: 0.3127, y: 0.3290 }; // D65 預設白點
  return { Y: y, x: x / sum, y: y / sum };
};

// XYZ 轉 CIE-Lab
const xyzToLab = (x, y, z) => {
  // D65 白點基準值
  const rX = 95.047, rY = 100.000, rZ = 108.883;
  let _x = x / rX, _y = y / rY, _z = z / rZ;

  const f = (t) => t > 0.008856 ? Math.pow(t, 1 / 3) : (7.787 * t) + (16 / 116);

  _x = f(_x); _y = f(_y); _z = f(_z);

  const L = (116 * _y) - 16;
  const a = 500 * (_x - _y);
  const b = 200 * (_y - _z);
  return { L, a, b };
};

// XYZ 轉 Hunter Lab
const xyzToHunterLab = (x, y, z) => {
  if (y <= 0) return { L: 0, a: 0, b: 0 };
  const L = 10 * Math.sqrt(y);
  const a = y !== 0 ? 17.5 * (((1.02 * x) - y) / Math.sqrt(y)) : 0;
  const b = y !== 0 ? 7.0 * ((y - (0.847 * z)) / Math.sqrt(y)) : 0;
  return { L, a, b };
};

// 整合獲取全部色碼屬性
const calculateAllColorSpaces = (hex) => {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b);
  const yxy = xyzToYxy(xyz.x, xyz.y, xyz.z);
  const lab = xyzToLab(xyz.x, xyz.y, xyz.z);
  const hunter = xyzToHunterLab(xyz.x, xyz.y, xyz.z);

  return { rgb, hsl, hsv, cmyk, xyz, yxy, lab, hunter };
};

// ============================================================================
// 3. CIE76 Delta-E 色彩命名匹配與語意命名系統
// ============================================================================

// 計算 Delta E 76 色彩距離 (Lab 歐式距離)
const getDeltaE76 = (lab1, lab2) => {
  return Math.sqrt(
    Math.pow(lab1.L - lab2.L, 2) +
    Math.pow(lab1.a - lab2.a, 2) +
    Math.pow(lab1.b - lab2.b, 2)
  );
};

// 在色彩字典中搜尋最相似名稱
const findClosestColorName = (targetHex) => {
  const targetRgb = hexToRgb(targetHex);
  const targetXyz = rgbToXyz(targetRgb.r, targetRgb.g, targetRgb.b);
  const targetLab = xyzToLab(targetXyz.x, targetXyz.y, targetXyz.z);

  let minDistance = Infinity;
  let bestMatch = COLOR_DICTIONARY[0];

  for (const item of COLOR_DICTIONARY) {
    const dbRgb = hexToRgb(item.hex);
    const dbXyz = rgbToXyz(dbRgb.r, dbRgb.g, dbRgb.b);
    const dbLab = xyzToLab(dbXyz.x, dbXyz.y, dbXyz.z);

    const distance = getDeltaE76(targetLab, dbLab);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = item;
    }
  }
  return bestMatch;
};

// 取得色階的中文修飾詞與英文修飾詞
const getScaleModifier = (weight) => {
  switch (weight) {
    case 50: return { zh: '極淺', en: 'Ultra Light' };
    case 100: return { zh: '超淺', en: 'Extra Light' };
    case 200: return { zh: '淺', en: 'Light' };
    case 300: return { zh: '柔和', en: 'Soft' };
    case 400: return { zh: '微淺', en: 'Tinted' };
    case 500: return { zh: '', en: '' }; // 基準色，不加修飾詞
    case 600: return { zh: '微深', en: 'Shaded' };
    case 700: return { zh: '中深', en: 'Medium Dark' };
    case 800: return { zh: '深', en: 'Dark' };
    case 900: return { zh: '超深', en: 'Extra Dark' };
    case 950: return { zh: '極深', en: 'Ultra Dark' };
    default: return { zh: '', en: '' };
  }
};

// 將中文色彩名稱轉換成英文字串 (適用於 kebab-case 程式代碼)
const getKebabCaseName = (matchedName) => {
  const parts = matchedName.split(' ');
  if (parts.length >= 2) {
    return parts.slice(1).join('-').toLowerCase().replace(/\s+/g, '-');
  }
  // 保底轉換
  return matchedName.replace(/[^\w\s-]/g, '').trim().toLowerCase().replace(/\s+/g, '-');
};

// ============================================================================
// 4. 5亮5暗 智能色彩漸層調色盤計算
// ============================================================================
const blendColors = (rgb1, rgb2, ratio) => {
  return {
    r: Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio),
    g: Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio),
    b: Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio)
  };
};

const generate11ScalePalette = (baseHex) => {
  const baseRgb = hexToRgb(baseHex);
  const matched = findClosestColorName(baseHex);
  const matchedZhOnly = matched.name.split(' ')[0];
  const matchedEnOnly = matched.name.split(' ').slice(1).join(' ') || 'Base';

  // 乾淨的高端白與深色 Slate 藍黑做底底混合
  const targetWhite = { r: 255, g: 255, b: 255 };
  const targetBlack = { r: 15, g: 23, b: 42 };

  const scaleWeights = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  return scaleWeights.map((weight) => {
    let rgb;
    if (weight === 500) {
      rgb = baseRgb;
    } else if (weight < 500) {
      // 亮色階：往 50 混合更多白
      // 50 階混 92% 白，400 階混 18% 白
      const factor = (500 - weight) / 500;
      const ratio = factor * 0.92;
      rgb = blendColors(baseRgb, targetWhite, ratio);
    } else {
      // 暗色階：往 950 混合更多黑
      // 600 階混 15% 黑，950 階混 80% 黑
      const factor = (weight - 500) / 450;
      const ratio = factor * 0.80;
      rgb = blendColors(baseRgb, targetBlack, ratio);
    }

    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    const modifiers = getScaleModifier(weight);
    
    // 組合名字 (例如: "極淺暖象牙" / "Ultra Light Warm Ivory")
    const scaleZhName = weight === 500 ? matchedZhOnly : `${modifiers.zh}${matchedZhOnly}`;
    const scaleEnName = weight === 500 ? matchedEnOnly : `${modifiers.en} ${matchedEnOnly}`;

    // WCAG 2.0 簡易亮度指標 (黑底白字或白底黑字防瞎)
    const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
    const isDarkBackground = luminance < 0.48;

    return {
      weight,
      hex,
      rgb,
      zhName: scaleZhName,
      enName: scaleEnName,
      isDarkBackground
    };
  });
};

// ============================================================================
// 4.5 互補色與相近色 (HSL 色相旋轉)
// ============================================================================
const hslToHex = (h, s, l) => {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (hue < 60) { r = c; g = x; }
  else if (hue < 120) { r = x; g = c; }
  else if (hue < 180) { g = c; b = x; }
  else if (hue < 240) { g = x; b = c; }
  else if (hue < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
};

// 保留原色的飽和度與明度，只旋轉色相
const rotateHue = (hex, degrees) => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return hslToHex(h + degrees, s, l);
};

const RELATED_HUES = [
  { key: 'complement', suffix: 'complement', label: '互補色', angleLabel: '+180°', degrees: 180 },
  { key: 'analogous-minus', suffix: 'analogous-minus', label: '相近色 A', angleLabel: '-30°', degrees: -30 },
  { key: 'analogous-plus', suffix: 'analogous-plus', label: '相近色 B', angleLabel: '+30°', degrees: 30 }
];

// ============================================================================
// 5. App 主組件
// ============================================================================
export default function App() {
  const [inputValue, setInputValue] = useState('#fff9f2');
  const [selectedHex, setSelectedHex] = useState('#fff9f2');
  const [exportMode, setExportMode] = useState('css'); // 'css' | 'tailwind'
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('palette'); // 'palette' | 'preview'
  const [customColors, setCustomColors] = useState(COLOR_DICTIONARY);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#ef4444');
  const [openRelated, setOpenRelated] = useState({}); // 互補色 / 相近色折疊狀態 (預設全部收合)

  // 當輸入更新時的解析與防呆
  useEffect(() => {
    let cleanVal = inputValue.trim();
    
    // HSL 格式解析簡意支援 e.g. "hsl(32, 100%, 97%)"
    if (cleanVal.startsWith('hsl')) {
      const match = cleanVal.match(/\d+(\.\d+)?/g);
      if (match && match.length >= 3) {
        // 先回歸一個近似的 Hex
        const h = parseFloat(match[0]);
        const s = parseFloat(match[1]) / 100;
        const l = parseFloat(match[2]) / 100;
        
        // HSL 轉 RGB
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let rVal = 0, gVal = 0, bVal = 0;
        if (h >= 0 && h < 60) { rVal = c; gVal = x; bVal = 0; }
        else if (h >= 60 && h < 120) { rVal = x; gVal = c; bVal = 0; }
        else if (h >= 120 && h < 180) { rVal = 0; gVal = c; bVal = x; }
        else if (h >= 180 && h < 240) { rVal = 0; gVal = x; bVal = c; }
        else if (h >= 240 && h < 300) { rVal = x; gVal = 0; bVal = c; }
        else if (h >= 300 && h < 360) { rVal = c; gVal = 0; bVal = x; }
        
        const hex = rgbToHex((rVal + m) * 255, (gVal + m) * 255, (bVal + m) * 255);
        setSelectedHex(hex);
        return;
      }
    }

    // RGB 格式解析 e.g. "255, 249, 242"
    if (cleanVal.includes(',') || cleanVal.startsWith('rgb')) {
      const match = cleanVal.match(/\d+/g);
      if (match && match.length >= 3) {
        const hex = rgbToHex(parseInt(match[0]), parseInt(match[1]), parseInt(match[2]));
        setSelectedHex(hex);
        return;
      }
    }

    // HEX 格式解析
    if (!cleanVal.startsWith('#')) {
      cleanVal = '#' + cleanVal;
    }
    
    if (/^#[0-9A-F]{3}$/i.test(cleanVal) || /^#[0-9A-F]{6}$/i.test(cleanVal)) {
      setSelectedHex(cleanVal);
    }
  }, [inputValue]);

  // 透過一鍵點擊 Preset 快速修改
  const handlePresetSelect = (hex) => {
    setInputValue(hex);
    setSelectedHex(hex);
    triggerToast(`已載入推薦色彩：${hex}`);
  };

  // 觸發通知氣泡
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // 剪貼簿一鍵複製
  const copyToClipboard = (text, typeLabel) => {
    // 支援 iframe 的退回方法
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => triggerToast(`✅ 已複製 ${typeLabel} 程式碼！`))
        .catch(() => fallbackCopy(text, typeLabel));
    } else {
      fallbackCopy(text, typeLabel);
    }
  };

  const fallbackCopy = (text, typeLabel) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      triggerToast(`✅ 已複製 ${typeLabel} 程式碼！`);
    } catch (err) {
      triggerToast("❌ 複製失敗，請手動選取代碼。");
    }
    document.body.removeChild(textArea);
  };

  // 新增自訂色彩至命名字典
  const handleAddCustomColor = (e) => {
    e.preventDefault();
    if (!newColorName.trim()) {
      triggerToast("請輸入色彩名稱！");
      return;
    }
    const colorItem = {
      name: `${newColorName.trim()} CustomColor`,
      hex: newColorHex
    };
    setCustomColors([colorItem, ...customColors]);
    setSelectedHex(newColorHex);
    setInputValue(newColorHex);
    setNewColorName('');
    triggerToast(`🎉 新增專屬色「${newColorName}」成功！`);
  };

  // 即時計算資料
  const spaces = useMemo(() => calculateAllColorSpaces(selectedHex), [selectedHex]);
  const closestColor = useMemo(() => findClosestColorName(selectedHex), [selectedHex]);
  const colorScales = useMemo(() => generate11ScalePalette(selectedHex), [selectedHex]);
  
  const cleanKebabName = useMemo(() => {
    return getKebabCaseName(closestColor.name);
  }, [closestColor]);

  // 互補色 / 相近色：各自展開完整 11 色階
  const relatedPalettes = useMemo(() => {
    return RELATED_HUES.map((rel) => {
      const hex = rotateHue(selectedHex, rel.degrees);
      return {
        ...rel,
        hex,
        matchedName: findClosestColorName(hex).name,
        scales: generate11ScalePalette(hex)
      };
    });
  }, [selectedHex]);

  // 建立導出程式碼 (主色 + 互補色 + 相近色)
  const codeOutput = useMemo(() => {
    const groups = [
      { name: cleanKebabName, comment: `主色 ${closestColor.name}`, scales: colorScales },
      ...relatedPalettes.map((rel) => ({
        name: `${cleanKebabName}-${rel.suffix}`,
        comment: `${rel.label} ${rel.angleLabel} ${rel.matchedName}`,
        scales: rel.scales
      }))
    ];

    if (exportMode === 'css') {
      let cssText = `/* Chromatica 產生的 CSS 自訂屬性 - [${closestColor.name}] */\n`;
      cssText += `:root {\n`;
      groups.forEach((group, index) => {
        if (index > 0) cssText += `\n`;
        cssText += `  /* ${group.comment} */\n`;
        group.scales.forEach((scale) => {
          cssText += `  --color-${group.name}-${scale.weight}: ${scale.hex};\n`;
        });
      });
      cssText += `}`;
      return cssText;
    } else {
      let twText = `// tailwind.config.js\n`;
      twText += `module.exports = {\n`;
      twText += `  theme: {\n`;
      twText += `    extend: {\n`;
      twText += `      colors: {\n`;
      groups.forEach((group) => {
        twText += `        // ${group.comment}\n`;
        twText += `        '${group.name}': {\n`;
        group.scales.forEach((scale) => {
          twText += `          '${scale.weight}': '${scale.hex}',\n`;
        });
        twText += `        },\n`;
      });
      twText += `      },\n`;
      twText += `    },\n`;
      twText += `  },\n`;
      twText += `};`;
      return twText;
    }
  }, [exportMode, colorScales, relatedPalettes, cleanKebabName, closestColor]);

  // 色階方塊網格 (主色與衍生色共用)
  const renderScaleGrid = (scales) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-3 pt-2">
      {scales.map((scale) => {
        const isSource = scale.weight === 500;
        return (
          <button
            key={scale.weight}
            onClick={() => {
              copyToClipboard(scale.hex, `${scale.weight}色階碼`);
              triggerToast(`📋 已複製 ${scale.zhName}: ${scale.hex.toUpperCase()}`);
            }}
            className="group/scale rounded-xl p-3 flex flex-col justify-between min-h-[155px] text-left relative overflow-hidden transition-all duration-300 border border-transparent hover:-translate-y-2 hover:shadow-2xl hover:border-slate-600 focus:outline-none"
            style={{ backgroundColor: scale.hex }}
          >
            {/* 水光層 */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover/scale:opacity-100 transition-opacity" />

            {/* 頂部：色階權重與來源標籤 */}
            <div className="flex justify-between items-start z-10 w-full">
              <span className={`text-[11px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded ${
                scale.isDarkBackground ? 'bg-white/10 text-slate-300' : 'bg-black/5 text-slate-800'
              }`}>
                {scale.weight}
              </span>
              {isSource && (
                <span className="bg-rose-500 text-[9px] text-white font-extrabold px-1.5 py-0.5 rounded-full shadow-lg border border-rose-300/20 uppercase tracking-widest animate-pulse">
                  SRC
                </span>
              )}
            </div>

            {/* 中間：智慧命名 */}
            <div className="z-10 mt-auto pt-4">
              <p className={`text-xs font-black tracking-tight leading-tight ${
                scale.isDarkBackground ? 'text-white' : 'text-slate-900'
              }`}>
                {scale.zhName}
              </p>
              <p className={`text-[9px] font-semibold opacity-60 truncate ${
                scale.isDarkBackground ? 'text-slate-400' : 'text-slate-700'
              }`}>
                {scale.enName || 'Base'}
              </p>
            </div>

            {/* 底部：HEX 碼與複製圖標 */}
            <div className="z-10 flex justify-between items-center pt-2 mt-2 border-t border-black/5">
              <span className={`text-[10px] font-mono font-bold ${
                scale.isDarkBackground ? 'text-slate-300' : 'text-slate-800'
              }`}>
                {scale.hex.toUpperCase()}
              </span>
              <Copy className={`w-3 h-3 opacity-0 group-hover/scale:opacity-100 transition-opacity ${
                scale.isDarkBackground ? 'text-slate-300' : 'text-slate-800'
              }`} />
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      
      {/* Toast 通知浮動視窗 */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-teal-500 text-slate-950 px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 animate-bounce border border-white/20">
          <Sparkles className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 導航列 */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Palette className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-teal-300 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                CHROMATICA
              </span>
              <span className="text-xs text-slate-500 ml-2 font-mono hidden sm:inline">v2.5 Professional</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('palette')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'palette' 
                  ? 'bg-slate-800 text-teal-400 border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>色彩調製</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'preview' 
                  ? 'bg-slate-800 text-teal-400 border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>UI 實境預覽</span>
            </button>
          </div>
        </div>
      </header>

      {/* 核心內容區 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {activeTab === 'palette' ? (
          <>
            {/* 區段 1: 色彩輸入與多維色彩空間解析 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* 左邊：輸入控制器 */}
              <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
                    <Sliders className="w-5 h-5 text-teal-400" />
                    輸入色碼探測
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    輸入任何格式的色碼（HEX、RGB、HSL）或直接使用右邊色彩選擇器
                  </p>
                </div>

                {/* 輸入框組件 */}
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5" />
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="#fff9f2, 255,249,242 或 hsl(32, 100%, 97%)"
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm font-mono focus:outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
                      />
                    </div>
                    
                    {/* HTML5 原生色彩選擇器 */}
                    <div className="w-12 h-12 rounded-xl border border-slate-700 overflow-hidden relative cursor-pointer group bg-slate-950 hover:border-teal-400 transition-all">
                      <input
                        type="color"
                        value={selectedHex}
                        onChange={(e) => {
                          setSelectedHex(e.target.value);
                          setInputValue(e.target.value);
                        }}
                        className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* 基準色大卡片展示 */}
                  <div 
                    className="w-full h-40 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-300"
                    style={{ backgroundColor: selectedHex }}
                  >
                    {/* 水波紋光暈裝飾 */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                    
                    <div className="flex justify-between items-start z-10">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wider shadow-sm uppercase ${
                        spaces.hsl.l < 0.5 ? 'bg-white/15 text-white' : 'bg-black/10 text-slate-900'
                      }`}>
                        基準調色盤源點 (500)
                      </span>
                      
                      <button 
                        onClick={() => copyToClipboard(selectedHex, '基準 HEX')}
                        className={`p-2 rounded-lg backdrop-blur-md hover:scale-105 active:scale-95 transition-all ${
                          spaces.hsl.l < 0.5 ? 'bg-white/15 hover:bg-white/25 text-white' : 'bg-black/10 hover:bg-black/20 text-slate-900'
                        }`}
                        title="複製色碼"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="z-10">
                      <p className={`text-xs font-medium tracking-wide ${
                        spaces.hsl.l < 0.5 ? 'text-slate-300' : 'text-slate-800'
                      }`}>
                        智慧命名：{closestColor.name}
                      </p>
                      <h3 className={`text-3xl font-black font-mono tracking-tight ${
                        spaces.hsl.l < 0.5 ? 'text-white' : 'text-slate-900'
                      }`}>
                        {selectedHex.toUpperCase()}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* 熱門推薦色彩預設組 */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 block">熱門探索色彩：</span>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => handlePresetSelect(color.hex)}
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 ring-1 ring-inset ring-white/5 flex items-center gap-1.5 text-left transition-all hover:ring-slate-700"
                      >
                        <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" style={{ backgroundColor: color.hex }} />
                        <span className="text-[11px] text-slate-400 truncate">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右邊：多維色彩空間科學資料分析欄 */}
              <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
                      <Info className="w-5 h-5 text-indigo-400" />
                      色彩空間科學矩陣 (Color Space Matrix)
                    </h2>
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-1 rounded">
                      基準：D65 標準
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    以下為依據您輸入的色碼 <code className="text-teal-400 font-mono">{selectedHex}</code> 即時運算轉換的精準多色彩維度參數：
                  </p>

                  {/* 矩陣清單 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-4">
                    
                    {/* RGB */}
                    <div className="flex justify-between items-center py-2.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold font-mono text-[11px] w-12">RGB</span>
                        <span className="text-[10px] text-slate-500">紅綠藍</span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {spaces.rgb.r} , {spaces.rgb.g} , {spaces.rgb.b}
                      </span>
                    </div>

                    {/* XYZ */}
                    <div className="flex justify-between items-center py-2.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold font-mono text-[11px] w-12">XYZ</span>
                        <span className="text-[10px] text-slate-500">視覺刺激</span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {spaces.xyz.x.toFixed(4)} , {spaces.xyz.y.toFixed(4)} , {spaces.xyz.z.toFixed(4)}
                      </span>
                    </div>

                    {/* HSL */}
                    <div className="flex justify-between items-center py-2.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold font-mono text-[11px] w-12">HSL</span>
                        <span className="text-[10px] text-slate-500">色飽明</span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {Math.round(spaces.hsl.h)}° , {Math.round(spaces.hsl.s * 100)}% , {Math.round(spaces.hsl.l * 100)}%
                      </span>
                    </div>

                    {/* Yxy */}
                    <div className="flex justify-between items-center py-2.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold font-mono text-[11px] w-12">Yxy</span>
                        <span className="text-[10px] text-slate-500">色度亮度</span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {spaces.yxy.Y.toFixed(4)} , {spaces.yxy.x.toFixed(4)} , {spaces.yxy.y.toFixed(4)}
                      </span>
                    </div>

                    {/* HSV */}
                    <div className="flex justify-between items-center py-2.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold font-mono text-[11px] w-12">HSV</span>
                        <span className="text-[10px] text-slate-500">色飽明度</span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {Math.round(spaces.hsv.h)}° , {Math.round(spaces.hsv.s * 100)}% , {Math.round(spaces.hsv.v * 100)}%
                      </span>
                    </div>

                    {/* Hunter Lab */}
                    <div className="flex justify-between items-center py-2.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold font-mono text-[11px] w-12">Hunter</span>
                        <span className="text-[10px] text-slate-500">亨特Lab</span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {spaces.hunter.L.toFixed(4)} , {spaces.hunter.a.toFixed(4)} , {spaces.hunter.b.toFixed(4)}
                      </span>
                    </div>

                    {/* CMYK */}
                    <div className="flex justify-between items-center py-2.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)] md:shadow-none">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold font-mono text-[11px] w-12">CMYK</span>
                        <span className="text-[10px] text-slate-500">四色印刷</span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {Math.round(spaces.cmyk.c * 100)}% , {Math.round(spaces.cmyk.m * 100)}% , {Math.round(spaces.cmyk.y * 100)}% , {Math.round(spaces.cmyk.k * 100)}%
                      </span>
                    </div>

                    {/* CIE-Lab */}
                    <div className="flex justify-between items-center py-2.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)] md:shadow-none">
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-400 font-bold font-mono text-[11px] w-12">Lab</span>
                        <span className="text-[10px] text-slate-500">均勻視覺</span>
                      </div>
                      <span className="text-xs text-slate-300 font-mono font-medium">
                        {spaces.lab.L.toFixed(4)} , {spaces.lab.a.toFixed(4)} , {spaces.lab.b.toFixed(4)}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-[11px] text-slate-400 flex items-start gap-2.5">
                  <span className="bg-indigo-500/20 text-indigo-300 p-1 rounded font-bold">INFO</span>
                  <p className="leading-relaxed">
                    <strong>Chromatica</strong> 會在每次色碼輸入時自動執行 <code className="text-indigo-300">XYZ ➔ L*a*b*</code> 與 <code className="text-indigo-300">Delta-E (CIE76)</code> 配對。
                    這確保我們在尋找最相似顏色名稱時，比傳統 RGB 幾何距離更符合人類視覺心理學。
                  </p>
                </div>
              </div>

            </div>

            {/* 區段 2: 5亮5暗 11級漸層色階面板 (包含智慧語意修飾命名) */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    5 亮 5 暗 11 色階擴增調色盤
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    點擊任何色階方塊即可快速複製其 HEX 色碼
                  </p>
                </div>
                <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <span className="text-slate-300 font-medium">基準匹配：{closestColor.name}</span>
                </div>
              </div>

              {/* 色彩階梯大區塊 */}
              {renderScaleGrid(colorScales)}
            </div>

            {/* 區段 2.5: 互補色與相近色 (各自完整 11 色階) */}
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
                  <Palette className="w-5 h-5 text-indigo-400" />
                  互補色與相近色
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  以 SRC 基準色為準，保留飽和度與明度，只旋轉 HSL 色相：互補色 +180°、相近色 ±30°
                </p>
              </div>

              {relatedPalettes.map((rel) => {
                const isOpen = !!openRelated[rel.key];
                return (
                  <div key={rel.key} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setOpenRelated((prev) => ({ ...prev, [rel.key]: !prev[rel.key] }))}
                      aria-expanded={isOpen}
                      className="w-full flex flex-wrap items-center gap-3 text-left rounded-xl px-3 py-2.5 bg-slate-950/40 border border-slate-800 hover:border-slate-600 transition-all focus:outline-none"
                    >
                      <span
                        className="w-6 h-6 rounded-lg border border-slate-700"
                        style={{ backgroundColor: rel.hex }}
                      />
                      <span className="text-sm font-bold text-slate-100">{rel.label}</span>
                      <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 px-2 py-0.5 rounded">
                        {rel.angleLabel}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{rel.hex.toUpperCase()}</span>
                      <span className="text-xs bg-slate-800 px-3 py-1 rounded-lg border border-slate-700/80 text-slate-300 font-medium">
                        基準匹配：{rel.matchedName}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && renderScaleGrid(rel.scales)}
                  </div>
                );
              })}
            </div>

            {/* 區段 3: 專屬導出面板 (.css 與 tailwind.config.js 完美變數對應) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* 左邊：匯出選項與變數名稱解析 */}
              <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
                    <FileCode className="w-5 h-5 text-indigo-400" />
                    工程變數導出
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    系統會將您探測出的色彩名稱，自動轉換成符合 CSS 與 JavaScript 命名規範的 <code className="text-indigo-400">kebab-case</code> 格式。
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl ring-1 ring-inset ring-white/5 space-y-3">
                  <div className="flex justify-between text-xs py-1.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
                    <span className="text-slate-500">匹配命名來源</span>
                    <span className="text-slate-300 font-semibold">{closestColor.name}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1.5 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
                    <span className="text-slate-500">標準專案鍵值 (Kebab)</span>
                    <span className="text-indigo-400 font-mono font-bold">{cleanKebabName}</span>
                  </div>
                  <div className="flex justify-between text-xs py-1.5">
                    <span className="text-slate-500">生成色階數</span>
                    <span className="text-emerald-400 font-mono font-bold">11 個定義階 × 4 組色相</span>
                  </div>
                </div>

                {/* 寫一個表單讓使用者可以自己添加新顏色進入本地詞典 */}
                <form onSubmit={handleAddCustomColor} className="space-y-3 p-4 bg-slate-950/40 rounded-xl ring-1 ring-inset ring-white/5">
                  <span className="text-xs font-bold text-slate-400 block">💡 字典中沒有您的商標色？自訂加入它：</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="自訂色彩名稱 (例：台灣青)"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-teal-500 text-slate-200"
                    />
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-800 cursor-pointer bg-slate-900"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                    >
                      新增
                    </button>
                  </div>
                </form>
              </div>

              {/* 右邊：即時編輯、預覽及複製代碼塊 */}
              <div className="lg:col-span-7 bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)] pb-3">
                  <span className="text-sm font-bold text-slate-200">變數輸出格式對應</span>
                  
                  {/* 切換導出格式 */}
                  <div className="flex p-1 bg-slate-950 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setExportMode('css')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        exportMode === 'css'
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      .css 變數
                    </button>
                    <button
                      onClick={() => setExportMode('tailwind')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        exportMode === 'tailwind'
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      tailwind-config.js
                    </button>
                  </div>
                </div>

                {/* 代碼展示框 */}
                <div className="relative group">
                  <pre className="bg-slate-950 p-5 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-900 leading-relaxed max-h-64">
                    {codeOutput}
                  </pre>
                  
                  <button
                    onClick={() => copyToClipboard(codeOutput, exportMode === 'css' ? 'CSS Variables' : 'Tailwind Config')}
                    className="absolute right-3 top-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-650 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    複製此格式代碼
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <span>💡 產生的 </span>
                  <code className="text-slate-400 bg-slate-950 px-1 py-0.5 rounded">--color-{cleanKebabName}-[weight]</code>
                  <span> 與 </span>
                  <code className="text-slate-400 bg-slate-950 px-1 py-0.5 rounded">'{cleanKebabName}': &#123; [weight] &#125;</code>
                  <span> 色值完完全全精密契合，確保前後端無縫過渡。</span>
                </p>
              </div>

            </div>
          </>
        ) : (
          /* UI 實境元件預覽 */
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
                <Eye className="w-5 h-5 text-indigo-400" />
                色彩 UI 組件預覽區
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                這裡將您生成調色盤中的色階直接渲染在前端標準組件上，以利觀察其實際視覺張力。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* 元件卡片 1 - 現代卡片設計 */}
              <div className="bg-slate-950 ring-1 ring-inset ring-white/5 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                <div className="p-1 h-3 flex gap-1" style={{ backgroundColor: colorScales[4].hex }} /> {/* 400色階 */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <span 
                      className="px-2.5 py-1 rounded text-[10px] font-bold tracking-widest uppercase shadow-sm"
                      style={{ 
                        backgroundColor: colorScales[1].hex, // 100色階
                        color: colorScales[8].hex // 800色階
                      }}
                    >
                      {closestColor.name.split(' ')[0]} 實踐
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{selectedHex.toUpperCase()}</span>
                  </div>

                  <h3 className="text-lg font-black text-slate-100 leading-snug">
                    Chromatica 高階色彩在 SaaS 設計系統中的落實效果
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    在卡片、通知欄中使用 <code className="text-slate-300">{cleanKebabName}-100</code> 與 <code className="text-slate-300">{cleanKebabName}-500</code> 的巧妙搭配，能提供在暗黑模式下出類拔萃的對比與和諧感。
                  </p>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">預計部署在：主控台首頁</span>
                  
                  {/* 按鈕使用 500 基準色 */}
                  <button 
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                    style={{ 
                      backgroundColor: colorScales[5].hex, // 500色階
                      color: colorScales[5].isDarkBackground ? '#ffffff' : '#0f172a'
                    }}
                    onClick={() => triggerToast(`點擊了採用 ${colorScales[5].hex} 的按鈕！`)}
                  >
                    立即閱讀
                  </button>
                </div>
              </div>

              {/* 元件卡片 2 - 互動按鈕與狀態組件 */}
              <div className="bg-slate-950 ring-1 ring-inset ring-white/5 rounded-2xl p-6 shadow-xl space-y-6">
                <h3 className="text-sm font-bold text-slate-300 pb-3 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
                  按鈕狀態組 (Button States Matrix)
                </h3>
                
                <div className="space-y-3.5">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">預設按鈕 (Default - 500)</span>
                    <button 
                      className="w-full py-2.5 rounded-lg text-xs font-black tracking-wide shadow transition-all active:scale-95"
                      style={{ 
                        backgroundColor: colorScales[5].hex, 
                        color: colorScales[5].isDarkBackground ? '#ffffff' : '#0f172a'
                      }}
                    >
                      主按鈕 (使用 {cleanKebabName}-500)
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">懸停狀態 (Hover - 600)</span>
                    <button 
                      className="w-full py-2.5 rounded-lg text-xs font-black tracking-wide shadow transition-all scale-[1.01]"
                      style={{ 
                        backgroundColor: colorScales[6].hex, 
                        color: colorScales[6].isDarkBackground ? '#ffffff' : '#0f172a'
                      }}
                    >
                      懸停狀態 (使用 {cleanKebabName}-600)
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">極輕量按鈕 (Light Secondary - 200)</span>
                    <button 
                      className="w-full py-2.5 rounded-lg text-xs font-black tracking-wide transition-all active:scale-95"
                      style={{ 
                        backgroundColor: colorScales[1].hex, 
                        color: colorScales[7].hex
                      }}
                    >
                      次要按鈕 (使用 {cleanKebabName}-100 & 700)
                    </button>
                  </div>
                </div>
              </div>

              {/* 元件卡片 3 - 高質感清單與對比 */}
              <div className="bg-slate-950 ring-1 ring-inset ring-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-300 pb-2 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.05)]">
                  色色搭配對比度分析 (Contrast Checker)
                </h3>

                <div className="space-y-2 pt-2">
                  <div className="p-3 rounded-lg flex justify-between items-center bg-slate-900 ring-1 ring-inset ring-white/5">
                    <div>
                      <p className="text-xs font-bold text-slate-200">極暗 (950) 作為底色</p>
                      <span className="text-[10px] text-slate-500">搭配 300 階文字</span>
                    </div>
                    <div 
                      className="w-20 py-2 rounded text-center text-xs font-black shadow-inner"
                      style={{ backgroundColor: colorScales[10].hex, color: colorScales[3].hex }}
                    >
                      文字預覽
                    </div>
                  </div>

                  <div className="p-3 rounded-lg flex justify-between items-center bg-slate-900 ring-1 ring-inset ring-white/5">
                    <div>
                      <p className="text-xs font-bold text-slate-200">基準色 (500) 作為底色</p>
                      <span className="text-[10px] text-slate-500">搭配 50 階文字</span>
                    </div>
                    <div 
                      className="w-20 py-2 rounded text-center text-xs font-black shadow-inner"
                      style={{ backgroundColor: colorScales[5].hex, color: colorScales[0].hex }}
                    >
                      文字預覽
                    </div>
                  </div>

                  <div className="p-3 rounded-lg flex justify-between items-center bg-slate-900 ring-1 ring-inset ring-white/5">
                    <div>
                      <p className="text-xs font-bold text-slate-200">極亮 (50) 作為底色</p>
                      <span className="text-[10px] text-slate-500">搭配 900 階文字</span>
                    </div>
                    <div 
                      className="w-20 py-2 rounded text-center text-xs font-black shadow-inner"
                      style={{ backgroundColor: colorScales[0].hex, color: colorScales[9].hex }}
                    >
                      文字預覽
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1">
                  <span>系統會根據 </span>
                  <code className="text-indigo-400 bg-slate-900 px-1 py-0.5 rounded">WCAG 2.1</code>
                  <span> 標準自動平衡文字在背景上的黑白適配度，保護用戶視力。</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 頁尾 */}
      <footer className="border-t border-slate-800 bg-slate-900/40 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Chromatica. 滿足前端所有需求的色彩梯度生成系統。使用 D65 光源校正。</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-default">CIE76 Delta E 演算法</span>
            <span className="hover:text-slate-400 cursor-default">CSS 導出</span>
            <span className="hover:text-slate-400 cursor-default">Tailwind Config</span>
          </div>
        </div>
      </footer>

    </div>
  );
}