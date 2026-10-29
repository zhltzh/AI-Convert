/**
 * Minimal, dependency-free DOCX writer.
 *
 * `html-docx-js` stores the whole document as an MHT altChunk inside
 * `word/afchunk.mht`, leaving `word/document.xml` empty. Microsoft Word renders
 * that, but WPS Office, Google Docs, Apple Pages and most conversion services
 * do not support altChunk and open the file as a blank document. This module
 * emits real WordprocessingML so the content survives everywhere.
 *
 * Supported blocks: headings, paragraphs, bold/italic/strike/inline code,
 * links, lists (nested), tables (borders + shaded header), code blocks,
 * blockquotes, horizontal rules and data-URI images.
 */

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const XML_NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
  + 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
  + 'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
const MONO_FONT = 'Consolas';
const BODY_FONT = 'Microsoft YaHei';
const CODE_FILL = 'F5F5F5';
const HEADER_FILL = 'F2F2F2';
const BORDER_COLOR = 'C7C7C7';
const LINK_COLOR = '0563C1';
const MAX_IMAGE_PT = 470;
const TEXT_WIDTH = 5000;

const HEADING_SIZES = { h1: 44, h2: 34, h3: 28, h4: 24, h5: 22, h6: 22 };

export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

/** Builds a STORED (uncompressed) zip archive that Office accepts. */
export function zipStore(files) {
  const encoder = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  const { time, day } = dosDateTime();

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const data = typeof file.data === 'string' ? encoder.encode(file.data) : file.data;
    const crc = crc32(data);

    const local = new Uint8Array(30 + name.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, time, true);
    localView.setUint16(12, day, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, name.length, true);
    localView.setUint16(28, 0, true);
    local.set(name, 30);
    parts.push(local, data);

    const entry = new Uint8Array(46 + name.length);
    const entryView = new DataView(entry.buffer);
    entryView.setUint32(0, 0x02014b50, true);
    entryView.setUint16(4, 20, true);
    entryView.setUint16(6, 20, true);
    entryView.setUint16(8, 0x0800, true);
    entryView.setUint16(10, 0, true);
    entryView.setUint16(12, time, true);
    entryView.setUint16(14, day, true);
    entryView.setUint32(16, crc, true);
    entryView.setUint32(20, data.length, true);
    entryView.setUint32(24, data.length, true);
    entryView.setUint16(28, name.length, true);
    entryView.setUint16(30, 0, true);
    entryView.setUint16(32, 0, true);
    entryView.setUint16(34, 0, true);
    entryView.setUint16(36, 0, true);
    entryView.setUint32(38, 0, true);
    entryView.setUint32(42, offset, true);
    entry.set(name, 46);
    central.push(entry);

    offset += local.length + data.length;
  });

  const centralSize = central.reduce((total, entry) => total + entry.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  return new Blob([...parts, ...central, end], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

function textRun(text, props = {}) {
  if (!text) return '';
  const rPr = runProps(props);
  return `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
}

function runProps({ bold, italic, strike, underline, color, size, font, shade }) {
  const inner = [
    font ? `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>` : '',
    bold ? '<w:b/>' : '',
    italic ? '<w:i/>' : '',
    strike ? '<w:strike/>' : '',
    color ? `<w:color w:val="${color}"/>` : '',
    size ? `<w:sz w:val="${size}"/><w:szCs w:val="${size}"/>` : '',
    underline ? '<w:u w:val="single"/>' : '',
    shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${shade}"/>` : '',
  ].join('');
  return inner ? `<w:rPr>${inner}</w:rPr>` : '';
}

function paragraph(inner, props = {}) {
  return `<w:p>${props.inner || ''}${inner}</w:p>`;
}

function spacingProps({ before = 0, after = 160, line = 276 }) {
  return `<w:spacing w:before="${before}" w:after="${after}" w:line="${line}" w:lineRule="auto"/>`;
}

function imageRun(context, element) {
  const source = element.getAttribute('src') || '';
  const image = context.images.get(source);
  if (!image) return textRun(element.getAttribute('alt') || '', { italic: true, color: '808080' });
  const width = image.width;
  const height = image.height;
  const id = image.id;
  return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">`
    + `<wp:extent cx="${width}" cy="${height}"/><wp:docPr id="${id}" name="Picture ${id}"/>`
    + '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
    + '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
    + '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
    + `<pic:nvPicPr><pic:cNvPr id="${id}" name="image${id}"/><pic:cNvPicPr/></pic:nvPicPr>`
    + `<pic:blipFill><a:blip r:embed="${image.relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`
    + '<pic:spPr><a:xfrm><a:off x="0" y="0"/>'
    + `<a:ext cx="${width}" cy="${height}"/></a:xfrm>`
    + '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
    + '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
}

function inlineContent(context, node, inherited = {}) {
  let xml = '';
  node.childNodes.forEach((child) => {
    if (child.nodeType === 3) {
      xml += textRun(child.nodeValue.replace(/\s+/g, ' '), inherited);
      return;
    }
    if (child.nodeType !== 1) return;
    const tag = child.tagName.toLowerCase();
    switch (tag) {
      case 'br':
        xml += '<w:r><w:br/></w:r>';
        break;
      case 'strong':
      case 'b':
        xml += inlineContent(context, child, { ...inherited, bold: true });
        break;
      case 'em':
      case 'i':
        xml += inlineContent(context, child, { ...inherited, italic: true });
        break;
      case 'del':
      case 's':
      case 'strike':
        xml += inlineContent(context, child, { ...inherited, strike: true });
        break;
      case 'code':
        xml += inlineContent(context, child, { ...inherited, font: MONO_FONT, shade: CODE_FILL, size: inherited.size });
        break;
      case 'a': {
        const href = child.getAttribute('href') || '';
        const linkId = href ? context.addLink(href) : null;
        const inner = inlineContent(context, child, { ...inherited, color: LINK_COLOR, underline: true });
        xml += linkId ? `<w:hyperlink r:id="${linkId}">${inner}</w:hyperlink>` : inner;
        break;
      }
      case 'img':
        xml += imageRun(context, child);
        break;
      default:
        xml += inlineContent(context, child, inherited);
    }
  });
  return xml;
}

function headingParagraph(context, element, tag) {
  const size = HEADING_SIZES[tag] || 22;
  const runs = inlineContent(context, element, { bold: true, size });
  const props = `<w:pPr>${spacingProps({ before: 240, after: 120 })}<w:keepNext/></w:pPr>`;
  return `<w:p>${props}${runs}</w:p>`;
}

function simpleParagraph(context, element, extra = '', inherited = {}) {
  const runs = inlineContent(context, element, inherited);
  return `<w:p><w:pPr>${spacingProps({})}${extra}</w:pPr>${runs}</w:p>`;
}

function codeBlock(context, element) {
  const text = element.textContent.replace(/\r\n?/g, '\n').replace(/\n+$/, '');
  const lines = text.split('\n');
  const runs = lines.map((line, index) => (index === 0 ? '' : '<w:r><w:br/></w:r>')
    + textRun(line, { font: MONO_FONT, size: 19, shade: CODE_FILL })).join('');
  const props = `<w:pPr>${spacingProps({ before: 120, after: 120, line: 240 })}`
    + `<w:shd w:val="clear" w:color="auto" w:fill="${CODE_FILL}"/>`
    + '<w:ind w:left="113" w:right="113"/></w:pPr>';
  return `<w:p>${props}${runs}</w:p>`;
}

function quoteParagraph(context, element, depth) {
  const content = blocks(context, element, { quote: depth + 1 });
  return content;
}

function listBlock(context, element, depth) {
  const ordered = element.tagName.toLowerCase() === 'ol';
  const numId = context.addList(ordered);
  const items = [...element.children].filter((child) => child.tagName.toLowerCase() === 'li');
  const xml = items.map((item) => {
    const nested = [];
    const clone = item.cloneNode(true);
    [...clone.children].forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (tag === 'ul' || tag === 'ol') {
        nested.push(child);
        clone.removeChild(child);
      }
    });
    const indent = 360 + Math.min(depth, 4) * 360;
    const props = `<w:pPr>${spacingProps({ after: 60 })}`
      + `<w:numPr><w:ilvl w:val="${Math.min(depth, 4)}"/><w:numId w:val="${numId}"/></w:numPr>`
      + `<w:ind w:left="${indent}" w:hanging="360"/></w:pPr>`;
    const runs = inlineContent(context, clone);
    const nestedXml = nested.map((child) => listBlock(context, child, depth + 1)).join('');
    return `<w:p>${props}${runs}</w:p>${nestedXml}`;
  }).join('');
  return xml;
}

function tableParagraph(context, element) {
  const runs = inlineContent(context, element);
  return `<w:p><w:pPr>${spacingProps({ after: 0, line: 240 })}</w:pPr>${runs}</w:p>`;
}

function tableBlock(context, element) {
  const rows = [...element.querySelectorAll('tr')];
  if (!rows.length) return '';
  const columnCount = rows.reduce((max, row) => Math.max(max, row.children.length), 1);
  const cellWidth = Math.floor(TEXT_WIDTH / columnCount);
  const borders = ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
    .map((side) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="${BORDER_COLOR}"/>`)
    .join('');
  const grid = Array.from({ length: columnCount }, () => `<w:gridCol w:w="${Math.round(9360 / columnCount)}"/>`).join('');

  const body = rows.map((row) => {
    const isHeader = [...row.children].every((cell) => cell.tagName.toLowerCase() === 'th');
    const cells = [...row.children].map((cell) => {
      const span = Number(cell.getAttribute('colspan') || 1);
      const width = Math.min(TEXT_WIDTH, cellWidth * (Number.isFinite(span) ? span : 1));
      const fill = isHeader ? `<w:shd w:val="clear" w:color="auto" w:fill="${HEADER_FILL}"/>` : '';
      const content = cell.querySelector('p, ul, ol, pre, blockquote')
        ? blocks(context, cell, { cell: true, bold: isHeader })
        : tableParagraph(context, cell);
      const inner = isHeader && !cell.querySelector('strong, b')
        ? `<w:p><w:pPr>${spacingProps({ after: 0, line: 240 })}</w:pPr>${inlineContent(context, cell, { bold: true })}</w:p>`
        : content;
      return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="pct"/>${fill}`
        + '<w:tcMar><w:top w:w="86" w:type="dxa"/><w:left w:w="113" w:type="dxa"/>'
        + '<w:bottom w:w="86" w:type="dxa"/><w:right w:w="113" w:type="dxa"/></w:tcMar>'
        + `</w:tcPr>${inner || '<w:p/>'}</w:tc>`;
    }).join('');
    return `<w:tr>${isHeader ? '<w:trPr><w:tblHeader/></w:trPr>' : ''}${cells}</w:tr>`;
  }).join('');

  return '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/>'
    + `<w:tblBorders>${borders}</w:tblBorders>`
    + '<w:tblCellMar><w:top w:w="86" w:type="dxa"/><w:left w:w="113" w:type="dxa"/>'
    + '<w:bottom w:w="86" w:type="dxa"/><w:right w:w="113" w:type="dxa"/></w:tblCellMar>'
    + '<w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>'
    + `</w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl><w:p><w:pPr>${spacingProps({ after: 0, line: 240 })}</w:pPr></w:p>`;
}

function horizontalRule() {
  return '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="D9D9D9"/></w:pBdr>'
    + `${spacingProps({ before: 120, after: 120 })}</w:pPr></w:p>`;
}

function blocks(context, container, options = {}) {
  const quoteDepth = options.quote || 0;
  let xml = '';
  [...container.childNodes].forEach((node) => {
    if (node.nodeType === 3) {
      const text = node.nodeValue.replace(/\s+/g, ' ').trim();
      if (text) xml += simpleParagraph(context, { childNodes: [node], textContent: node.nodeValue }, '', options.bold ? { bold: true } : {});
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    let piece = '';
    if (HEADING_SIZES[tag]) piece = headingParagraph(context, node, tag);
    else if (tag === 'p') piece = simpleParagraph(context, node, '', options.bold ? { bold: true } : {});
    else if (tag === 'ul' || tag === 'ol') piece = listBlock(context, node, 0);
    else if (tag === 'pre') piece = codeBlock(context, node);
    else if (tag === 'table') piece = tableBlock(context, node);
    else if (tag === 'hr') piece = horizontalRule();
    else if (tag === 'blockquote') piece = quoteParagraph(context, node, quoteDepth);
    else if (['div', 'section', 'article', 'main', 'header', 'footer', 'span', 'figure'].includes(tag)) {
      piece = blocks(context, node, { ...options, quote: quoteDepth });
    } else if (tag === 'img') piece = `<w:p><w:pPr>${spacingProps({})}</w:pPr>${imageRun(context, node)}</w:p>`;
    else piece = simpleParagraph(context, node, '');
    if (!piece) return;
    xml += quoteDepth > 0 && /^<w:p>/.test(piece) ? applyQuote(piece, quoteDepth) : piece;
  });
  return xml;
}

function applyQuote(xml, depth) {
  const indent = 360 * depth;
  const border = '<w:pBdr><w:left w:val="single" w:sz="12" w:space="8" w:color="BBBBBB"/></w:pBdr>';
  return xml.replace('<w:pPr>', `<w:pPr>${border}<w:ind w:left="${indent}" w:right="120"/>`);
}

function numberingXml(orderedLists) {
  const bulletLevels = Array.from({ length: 5 }, (_, level) => {
    const indent = 360 + level * 360;
    return `<w:lvl w:ilvl="${level}"><w:start w:val="1"/><w:numFmt w:val="bullet"/>`
      + '<w:lvlText w:val="•"/><w:lvlJc w:val="left"/>'
      + `<w:pPr><w:ind w:left="${indent}" w:hanging="360"/></w:pPr>`
      + '<w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr></w:lvl>';
  }).join('');
  const decimalLevels = Array.from({ length: 5 }, (_, level) => {
    const indent = 360 + level * 360;
    return `<w:lvl w:ilvl="${level}"><w:start w:val="1"/><w:numFmt w:val="${level === 0 ? 'decimal' : 'lowerLetter'}"/>`
      + `<w:lvlText w:val="%${level + 1}."/><w:lvlJc w:val="left"/>`
      + `<w:pPr><w:ind w:left="${indent}" w:hanging="360"/></w:pPr></w:lvl>`;
  }).join('');
  const nums = orderedLists.map((ordered, index) => {
    const numId = index + 1;
    const abstractId = ordered ? 1 : 0;
    return `<w:num w:numId="${numId}"><w:abstractNumId w:val="${abstractId}"/></w:num>`;
  }).join('');
  return `${XML_HEADER}<w:numbering ${XML_NS}>`
    + `<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>${bulletLevels}</w:abstractNum>`
    + `<w:abstractNum w:abstractNumId="1"><w:multiLevelType w:val="hybridMultilevel"/>${decimalLevels}</w:abstractNum>`
    + `${nums}</w:numbering>`;
}

function stylesXml() {
  return `${XML_HEADER}<w:styles ${XML_NS}><w:docDefaults><w:rPrDefault><w:rPr>`
    + `<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="${BODY_FONT}" w:cs="Calibri"/>`
    + '<w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault>'
    + `<w:pPrDefault><w:pPr>${spacingProps({})}</w:pPr></w:pPrDefault></w:docDefaults>`
    + '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>'
    + '</w:styles>';
}

function contentTypesXml() {
  return `${XML_HEADER}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    + '<Default Extension="xml" ContentType="application/xml"/>'
    + '<Default Extension="png" ContentType="image/png"/>'
    + '<Default Extension="jpg" ContentType="image/jpeg"/>'
    + '<Default Extension="jpeg" ContentType="image/jpeg"/>'
    + '<Default Extension="gif" ContentType="image/gif"/>'
    + '<Default Extension="bmp" ContentType="image/bmp"/>'
    + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    + '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
    + '<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>'
    + '</Types>';
}

function packageRelsXml() {
  return `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
    + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
    + '</Relationships>';
}

function documentRelsXml(links, images) {
  const base = '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    + '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>';
  const linkRels = links.map((link) => `<Relationship Id="${link.relId}" `
    + 'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" '
    + `Target="${escapeXml(link.href)}" TargetMode="External"/>`).join('');
  const imageRels = images.map((image) => `<Relationship Id="${image.relId}" `
    + 'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" '
    + `Target="media/${image.name}"/>`).join('');
  return `${XML_HEADER}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
    + base + linkRels + imageRels + '</Relationships>';
}

function decodeDataUri(src) {
  const match = /^data:(image\/(png|jpeg|jpg|gif|bmp));base64,([a-z0-9+/=\s]+)$/i.exec(src || '');
  if (!match) return null;
  try {
    const binary = atob(match[3].replace(/\s+/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const ext = match[2].toLowerCase() === 'jpg' ? 'jpeg' : match[2].toLowerCase();
    return { bytes, ext };
  } catch {
    return null;
  }
}

function probeImageSize(src) {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve(null);
      return;
    }
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function collectImages(root) {
  const map = new Map();
  const list = [];
  const nodes = [...root.querySelectorAll('img[src^="data:image/"]')];
  let index = 0;
  for (const node of nodes) {
    const source = node.getAttribute('src');
    if (map.has(source)) {
      map.set(source, map.get(source));
      continue;
    }
    const decoded = decodeDataUri(source);
    if (!decoded) continue;
    const size = await probeImageSize(source);
    const widthPt = Math.min(MAX_IMAGE_PT, size?.width ? (size.width * 72) / 96 : 360);
    const heightPt = size?.height ? (widthPt * size.height) / size.width : widthPt * 0.6;
    index += 1;
    const image = {
      name: `image${index}.${decoded.ext}`,
      bytes: decoded.bytes,
      width: Math.round(widthPt * 12700),
      height: Math.round(heightPt * 12700),
      relId: `rIdImg${index}`,
      id: index,
    };
    map.set(source, image);
    list.push(image);
  }
  return { map, list };
}

function sectPr() {
  return '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
    + '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="851" w:footer="992" w:gutter="0"/>'
    + '</w:sectPr>';
}

/**
 * Converts an HTML fragment into a DOCX blob.
 * @param {string} html sanitized HTML fragment
 * @returns {Promise<Blob>}
 */
export async function buildDocx(html) {
  if (typeof DOMParser === 'undefined') {
    throw new Error('DOCX 导出需要浏览器环境。');
  }
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const { map, list } = await collectImages(doc.body);

  const links = [];
  const linkIndex = new Map();
  const lists = [];
  const context = {
    images: map,
    addLink(href) {
      if (linkIndex.has(href)) return linkIndex.get(href);
      const relId = `rIdLink${links.length + 1}`;
      links.push({ href, relId });
      linkIndex.set(href, relId);
      return relId;
    },
    addList(ordered) {
      lists.push(ordered);
      return lists.length;
    },
  };

  const body = blocks(context, doc.body, {});
  const documentXml = `${XML_HEADER}<w:document ${XML_NS}><w:body>${body}${sectPr()}</w:body></w:document>`;

  const files = [
    { name: '[Content_Types].xml', data: contentTypesXml() },
    { name: '_rels/.rels', data: packageRelsXml() },
    { name: 'word/document.xml', data: documentXml },
    { name: 'word/_rels/document.xml.rels', data: documentRelsXml(links, list) },
    { name: 'word/styles.xml', data: stylesXml() },
    { name: 'word/numbering.xml', data: numberingXml(lists) },
    ...list.map((image) => ({ name: `word/media/${image.name}`, data: image.bytes })),
  ];

  return zipStore(files);
}
