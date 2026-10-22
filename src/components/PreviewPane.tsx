import { useState, useMemo } from 'react';
import { Eye, Code2, FolderTree, Monitor, Smartphone, Tablet, Check, Copy, Download } from 'lucide-react';
import type { ProjectFile } from '@/types';

interface PreviewPaneProps {
  html: string | null;
  files: ProjectFile[];
  isBuilding: boolean;
}

type Tab = 'preview' | 'code' | 'files';
type Viewport = 'desktop' | 'tablet' | 'mobile';

export function PreviewPane({ html, files, isBuilding }: PreviewPaneProps) {
  const [tab, setTab] = useState<Tab>('preview');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  const srcDoc = useMemo(() => {
    if (!html) return '';
    return html;
  }, [html]);

  const viewportWidths: Record<Viewport, string> = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  const handleCopyCode = async () => {
    if (html) {
      setCopyError('');
      try {
        await navigator.clipboard.writeText(html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
        setCopyError('Clipboard access is unavailable in this browser.');
      }
    }
  };

  const handleDownload = () => {
    if (!html) return;
    setDownloadError('');
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'index.html';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch {
      setDownloadError('Could not download the HTML file in this browser.');
    }
  };

  if (isBuilding && !html) {
    return (
      <div className="h-full flex items-center justify-center bg-ink-900/50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-2 border-electric-500/30 border-t-electric-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Generating your website...</p>
          <p className="text-xs text-slate-700 mt-1">This will only take a moment</p>
        </div>
      </div>
    );
  }

  if (!html && !isBuilding) {
    return (
      <div className="h-full flex items-center justify-center bg-ink-900/50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass flex items-center justify-center">
            <Eye className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-sm text-slate-500">No preview yet</p>
          <p className="text-xs text-slate-700 mt-1">Start a conversation to generate your website</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 flex-shrink-0 bg-ink-850/50">
        <div className="flex items-center gap-1">
          <TabButton active={tab === 'preview'} onClick={() => setTab('preview')} icon={Eye} label="Preview" />
          <TabButton active={tab === 'code'} onClick={() => setTab('code')} icon={Code2} label="Code" />
          <TabButton active={tab === 'files'} onClick={() => setTab('files')} icon={FolderTree} label="Files" />
        </div>

        <div className="flex items-center gap-1">
          {tab === 'preview' && (
            <>
              <ViewportButton label="Desktop preview" active={viewport === 'desktop'} onClick={() => setViewport('desktop')} icon={Monitor} />
              <ViewportButton label="Tablet preview" active={viewport === 'tablet'} onClick={() => setViewport('tablet')} icon={Tablet} />
              <ViewportButton label="Mobile preview" active={viewport === 'mobile'} onClick={() => setViewport('mobile')} icon={Smartphone} />
            </>
          )}

          {tab === 'code' && (
            <button
              type="button"
              onClick={handleCopyCode}
              aria-label="Copy HTML source"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-electric-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download index.html"
            title="Download generated HTML"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
      {(copyError || downloadError) && (
        <p role="alert" className="border-b border-white/[0.06] px-4 py-2 text-xs text-red-300">
          {copyError || downloadError}
        </p>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'preview' && (
          <div className="h-full bg-ink-900/30 overflow-auto flex justify-center p-2">
            <div
              className="h-full transition-all duration-300 bg-white rounded-lg overflow-hidden shadow-2xl"
              style={{ width: viewportWidths[viewport], maxWidth: '100%' }}
            >
              <iframe
                srcDoc={srcDoc}
                title="Website Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

        {tab === 'code' && (
          <div className="h-full overflow-auto bg-ink-900/50">
            <pre className="text-[11px] leading-relaxed text-slate-400 font-mono p-4 whitespace-pre-wrap break-words">
              {html}
            </pre>
          </div>
        )}

        {tab === 'files' && (
          <div className="h-full overflow-auto bg-ink-900/50 p-4">
            <div className="space-y-1">
              {files.map((file) => (
                <FileRow
                  key={file.path + file.name}
                  file={file}
                  selected={selectedFile?.name === file.name}
                  onClick={() => setSelectedFile(file)}
                />
              ))}
            </div>
            {selectedFile && (
              <div className="mt-4 p-3 glass rounded-xl">
                <div className="text-xs font-mono text-slate-400 mb-2">{selectedFile.path}{selectedFile.name}</div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-electric-400" />
                    {selectedFile.language}
                  </span>
                  <span>{selectedFile.size}</span>
                </div>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  This is the generated HTML file. Switch to the Code tab to view its source.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Eye;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-white/[0.06] text-white'
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function ViewportButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Monitor;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
        active
          ? 'bg-electric-500/15 text-electric-400 border border-electric-500/20'
          : 'text-slate-600 hover:text-slate-400 border border-transparent'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function FileRow({
  file,
  selected,
  onClick,
}: {
  file: ProjectFile;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
        selected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.02]'
      }`}
    >
      <Code2 className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
      <span className="text-xs text-slate-300 font-mono flex-1 truncate">{file.name}</span>
      <span className="text-[10px] text-slate-600">{file.size}</span>
    </button>
  );
}
