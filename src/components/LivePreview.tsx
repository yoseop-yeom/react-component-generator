import { useState } from 'react';
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

interface LivePreviewProps {
  code: string;
}

type Viewport = 'desktop' | 'tablet' | 'mobile';

const VIEWPORTS: { key: Viewport; label: string; width: number | null }[] = [
  { key: 'desktop', label: '데스크탑', width: null },
  { key: 'tablet', label: '태블릿', width: 768 },
  { key: 'mobile', label: '모바일', width: 375 },
];

export function LivePreview({ code }: LivePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const activeWidth = VIEWPORTS.find((v) => v.key === viewport)?.width;

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
        <div className="viewport-toggle" role="group" aria-label="미리보기 화면 크기">
          {VIEWPORTS.map((v) => (
            <button
              key={v.key}
              type="button"
              className={`viewport-btn ${viewport === v.key ? 'viewport-btn--active' : ''}`}
              aria-pressed={viewport === v.key}
              onClick={() => setViewport(v.key)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div className="preview-render">
            {activeWidth ? (
              <div className="preview-frame" style={{ width: activeWidth }}>
                <ReactLivePreview />
              </div>
            ) : (
              <ReactLivePreview />
            )}
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
