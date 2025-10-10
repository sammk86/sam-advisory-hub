import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Service'
    const type = searchParams.get('type') || 'Service'
    const price = searchParams.get('price') || 'Contact us'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 25% 25%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)
              `,
            }}
          />

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              textAlign: 'center',
              maxWidth: '1000px',
              zIndex: 1,
            }}
          >
            {/* Logo/Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '20px',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#667eea',
                }}
              >
                M
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}
              >
                SamAdvisoryHub
              </div>
            </div>

            {/* Service Type Badge */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: '25px',
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '30px',
                backdropFilter: 'blur(10px)',
              }}
            >
              {type}
            </div>

            {/* Service Title */}
            <div
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '30px',
                lineHeight: 1.2,
                textAlign: 'center',
                maxWidth: '900px',
              }}
            >
              {title}
            </div>

            {/* Price */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                padding: '20px 40px',
                borderRadius: '15px',
                marginBottom: '40px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  color: '#ffffff',
                  marginRight: '10px',
                }}
              >
                Starting from
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}
              >
                {price}
              </div>
            </div>

            {/* Expert Info */}
            <div
              style={{
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
              }}
            >
              Expert guidance by Dr. Sam Mokhtari
            </div>
            <div
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: '8px',
              }}
            >
              Data & AI Expert with 15+ years experience
            </div>
          </div>

          {/* Bottom Accent */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
