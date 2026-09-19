import { ImageResponse } from 'next/og';

export const size = {
  width: 192,
  height: 192,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1A3629',
          borderRadius: '42px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            border: '6px solid #C8E6C0',
            borderRadius: '50%',
            color: '#C8E6C0',
            fontWeight: '900',
            fontSize: '72px',
            fontFamily: 'monospace',
            letterSpacing: '-2px',
          }}
        >
          C
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
