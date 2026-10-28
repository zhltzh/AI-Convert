/**
 * Shared drag-and-drop wiring for local file inputs.
 * Drops are accepted on the whole `target` region (usually the editor pane or the
 * upload area) so users do not have to hit the small dashed box exactly.
 */

function hasFiles(event) {
  const types = event.dataTransfer?.types;
  return !types || Array.from(types).includes('Files');
}

export function wireFileDrop({
  target,
  zone,
  isValid,
  rejectMessage,
  maxSize,
  tooLargeMessage,
  onFile,
  setStatus,
}) {
  if (!target || typeof onFile !== 'function') return () => {};

  let depth = 0;
  const highlight = (active) => {
    target.classList.toggle('is-dragover', active);
    zone?.classList.toggle('is-dragover', active);
  };

  const takeFiles = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;
    const [file] = list;
    if (typeof isValid === 'function' && !isValid(file)) {
      setStatus?.(rejectMessage, true);
      return;
    }
    if (maxSize && file.size > maxSize) {
      setStatus?.(tooLargeMessage, true);
      return;
    }
    await onFile(file);
  };

  const onDragEnter = (event) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    depth += 1;
    highlight(true);
  };

  const onDragOver = (event) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    highlight(true);
  };

  const onDragLeave = (event) => {
    if (!hasFiles(event)) return;
    depth = Math.max(0, depth - 1);
    if (depth === 0) highlight(false);
  };

  const onDrop = (event) => {
    event.preventDefault();
    depth = 0;
    highlight(false);
    takeFiles(event.dataTransfer?.files);
  };

  target.addEventListener('dragenter', onDragEnter);
  target.addEventListener('dragover', onDragOver);
  target.addEventListener('dragleave', onDragLeave);
  target.addEventListener('drop', onDrop);

  return () => {
    target.removeEventListener('dragenter', onDragEnter);
    target.removeEventListener('dragover', onDragOver);
    target.removeEventListener('dragleave', onDragLeave);
    target.removeEventListener('drop', onDrop);
    highlight(false);
  };
}
