import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '8px',
          fontWeight: '900',
          fontSize: '20px',
          fontFamily: 'monospace',
          border: '2px solid #FFFDF9',
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
