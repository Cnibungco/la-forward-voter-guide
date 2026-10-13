import {ImageResponse} from 'next/og'

export const shareImageSize = {width: 1200, height: 630}
export const shareImageContentType = 'image/png'

/** Social card. The election name is set in type so a crop still names the guide. */
export function shareImage(electionName: string) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: '#00285a',
        color: '#ffffff',
        padding: '72px 80px',
      }}
    >
      <div style={{display: 'flex', width: 96, height: 12, background: '#ffa400', marginBottom: 36}} />
      <div style={{display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1}}>
        LA Forward Voter Guide
      </div>
      <div style={{display: 'flex', fontSize: 36, marginTop: 28, color: '#ffa400'}}>{`${electionName} election`}</div>
    </div>,
    shareImageSize,
  )
}
