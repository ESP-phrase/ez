export default function GoatLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left horn — sweeps back and up */}
      <path
        d="M14.5 18C12.5 13.5 9 7.5 6.5 3C5.5 1 7 0 8.5 1C10 2 10.5 5.5 11 8.5C11.5 11.5 13 15 16 17.5Z"
        fill="white"
      />
      {/* Left horn inner shadow line */}
      <path
        d="M13 15C11.5 11 9.5 6.5 8.5 3C9.5 4 11 8 12.5 13Z"
        fill="rgba(0,0,0,0.15)"
      />

      {/* Right horn — mirror */}
      <path
        d="M25.5 18C27.5 13.5 31 7.5 33.5 3C34.5 1 33 0 31.5 1C30 2 29.5 5.5 29 8.5C28.5 11.5 27 15 24 17.5Z"
        fill="white"
      />
      <path
        d="M27 15C28.5 11 30.5 6.5 31.5 3C30.5 4 29 8 27.5 13Z"
        fill="rgba(0,0,0,0.15)"
      />

      {/* Left ear */}
      <path
        d="M7.5 22C5 19.5 3.5 24 5.5 25.5C7 26.5 10 25.5 9 22.5C8.5 21 7.5 22 7.5 22Z"
        fill="white"
      />

      {/* Right ear */}
      <path
        d="M32.5 22C35 19.5 36.5 24 34.5 25.5C33 26.5 30 25.5 31 22.5C31.5 21 32.5 22 32.5 22Z"
        fill="white"
      />

      {/* Face */}
      <ellipse cx="20" cy="28" rx="12" ry="13" fill="white" />

      {/* Muzzle */}
      <ellipse cx="20" cy="34.5" rx="7" ry="5" fill="rgba(148,163,184,0.22)" />

      {/* Left eye — rectangular pupil (real goat characteristic) */}
      <rect x="13.5" y="27" width="4" height="2.5" rx="1" fill="#0f172a" />

      {/* Right eye */}
      <rect x="22.5" y="27" width="4" height="2.5" rx="1" fill="#0f172a" />

      {/* Chin beard tuft */}
      <path
        d="M16.5 41C16 43.5 17.5 44 20 44C22.5 44 24 43.5 23.5 41C22.5 39.5 17.5 39.5 16.5 41Z"
        fill="white"
      />
    </svg>
  );
}
