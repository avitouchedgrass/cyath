import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
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
          color: '#FFFDF9',
          borderRadius: '36px',
          fontWeight: '900',
          fontSize: '110px',
          fontFamily: 'monospace',
          border: '8px solid #FFFDF9',
        }}
      >
        C
      </div>
    ),
    {
      ...size,
    }
  );
}
