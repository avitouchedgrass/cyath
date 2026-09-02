import { ImageResponse } from 'next/og';

export const runtime = 'edge';
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
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
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
                border: '4px solid #1A3629',
              }}
            >
              C
            </div>
            <div
              style={{
                fontSize: '44px',
                fontWeight: '900',
                color: '#1A3629',
                letterSpacing: '-1px',
              }}
            >
              Cyath
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              padding: '10px 24px',
              borderRadius: '999px',
              backgroundColor: '#FFFDF9',
              border: '3px solid #1A3629',
              fontSize: '18px',
              fontWeight: '700',
              color: '#1A3629',
            }}
          >
            16-Bit Metabolic Engine
          </div>
        </div>

        {/* Center Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: '900',
              color: '#1A3629',
              lineHeight: '1.1',
              letterSpacing: '-2px',
            }}
          >
            Pixel-Perfect Habits.
            <br />
            Calibrated Whole-Food Fuel.
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: '500',
              color: '#2C4A3B',
              maxWidth: '900px',
            }}
          >
            Log daily routines in 30 seconds, track whole-food protein targets, and uncover what drives your best energy days.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {['30-Sec Check-ins', 'Whole-Food Recipes', 'Pattern Engine', 'Floating Sanctuary'].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  display: 'flex',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFDF9',
                  border: '3px solid #1A3629',
                  boxShadow: '4px 4px 0px #1A3629',
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#1A3629',
                }}
              >
                {tag}
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
