import { ImageResponse } from 'next/og';

export const alt = 'Cyath · 16-Bit Metabolic Health & Habit Engine';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#F4F0EA',
          padding: '60px',
          fontFamily: 'sans-serif',
          border: '16px solid #1A3629',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: '#1A3629',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFDF9',
                fontSize: '32px',
                fontWeight: '900',
              }}
            >
              C
            </div>
            <div style={{ fontSize: '44px', fontWeight: '900', color: '#1A3629' }}>
              Cyath
            </div>
          </div>
          <div
            style={{
              padding: '10px 24px',
              borderRadius: '999px',
              backgroundColor: '#FFFDF9',
              border: '3px solid #1A3629',
              fontSize: '18px',
              fontWeight: '700',
              color: '#1A3629',
            }}
          >
            @CyathHealth
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '60px',
              fontWeight: '900',
              color: '#1A3629',
              lineHeight: '1.1',
              letterSpacing: '-1.5px',
            }}
          >
            16-Bit Health Engine &amp; Daily Habit Tracker
          </div>
          <div style={{ fontSize: '24px', fontWeight: '500', color: '#2C4A3B', maxWidth: '850px' }}>
            High-protein recipes, circadian habit protocols, and statistical energy insights without tracking burnout.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {['High-Protein Meals', '30s Daily Check-in', '16-Bit Island Diorama', 'Zero Spreadsheets'].map(
            (pill) => (
              <div
                key={pill}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#FFFDF9',
                  border: '3px solid #1A3629',
                  boxShadow: '3px 3px 0px #1A3629',
                  fontSize: '16px',
                  fontWeight: '800',
                  color: '#1A3629',
                }}
              >
                {pill}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
