import React from 'react'
import './GetApp.css'

const GooglePlayIcon = () => (
  <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.18 23.76c.3.17.65.19.97.07L14.66 12 3.18.17a1.08 1.08 0 0 0-.97.07C1.82.54 1.5 1 1.5 1.5v20.99c0 .5.32.97.82 1.27zm17.28-14.43L17.6 7.77 4.53 1.48 15.07 12l2.56-2.56 2.83 1.89zm0 5.35L17.6 16.2l-2.53-2.54L15.07 12l2.56 2.56 2.83-1.88zm-16.75 9.84 13.07-6.29L17.6 15.7 4.53 22.52z" />
  </svg>
)

const AppleIcon = () => (
  <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04l-.07.28zM13 3.5C13.73 2.67 14.94 2.04 15.94 2c.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
)

function GetApp() {
  return (
    <>
    <div className="page">
      <div className="card">

        <div className="logo-mark">
          <span>🐾</span>
        </div>

        <h1 className="heading">
          Cuddle <span className="brand-accent">Matte</span>
        </h1>

        <p className="subheading">
          Download app from your device app store to continue.<br />
          Available on iOS and Android. web version coming soon!<br />
          website is for informational purposes only.
        </p>

        <div className="divider">
          <div className="divider-line" />
          <span className="divider-text">Download now</span>
          <div className="divider-line" />
        </div>

        <div className="button-group">
          <a
            href="https://play.google.com/store/apps/details?id=com.cuddlematte"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-google"
          >
            <GooglePlayIcon />
            <span>Get it on Google Play</span>
          </a>

          <a
            href="https://apps.apple.com/app/cuddlematte"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-apple"
          >
            <AppleIcon />
            <span>Download on the App Store</span>
          </a>
        </div>

        <p className="footer-note">Free to download · No account needed to browse</p>
      </div>
    </div>
    </>
  )
}

export default GetApp