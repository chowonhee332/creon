export default function PageLoading() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <style>{`
        @keyframes creon-page-draw {
          0%   { stroke-dashoffset: 1; opacity: 1; }
          60%  { stroke-dashoffset: 0; opacity: 1; }
          80%  { stroke-dashoffset: 0; opacity: 0; }
          100% { stroke-dashoffset: 1; opacity: 0; }
        }
      `}</style>
      <svg width="68" height="48" viewBox="0 0 189 132" xmlns="http://www.w3.org/2000/svg" fill="none">
        <defs>
          <linearGradient id="ll-g-page" x1="20" y1="110" x2="170" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0040D8"/><stop offset="1" stopColor="#48BBFF"/>
          </linearGradient>
        </defs>
        <path
          style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'creon-page-draw 2.6s ease-in-out infinite' }}
          stroke="url(#ll-g-page)"
          strokeWidth="30"
          strokeLinecap="round"
          pathLength="1"
          d="M17.6664 113.096C17.0164 100.926 18.0964 88.1461 24.0464 77.2661C29.4364 67.4061 39.3064 60.5961 49.5764 56.5661C62.9464 51.3161 79.0364 48.8461 93.0164 53.6561C109.476 59.3161 119.596 76.1561 117.786 93.4061C117.046 100.496 114.096 107.896 107.666 111.566C100.386 115.726 91.0164 114.766 83.7264 111.156C82.0764 110.336 80.4964 109.376 79.0364 108.256C72.7564 103.476 68.2364 96.6561 65.1964 89.3661C58.1864 72.5361 58.7364 52.2561 70.4464 37.6861C79.8264 26.0161 94.4464 19.1961 109.196 17.7761C118.246 16.9061 127.556 18.0661 135.966 21.5861C146.916 26.1761 155.546 34.9861 161.626 45.0361C167.706 55.0861 170.956 70.7261 170.956 79.9461"
        />
      </svg>
    </div>
  );
}
