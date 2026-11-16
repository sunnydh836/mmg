'use client';

import React, { useState } from 'react';

// Native styled helper to support styled.div syntax in Next.js / React 19 without external dependencies
const styled = {
    div: (strings: TemplateStringsArray, ...values: unknown[]) => {
        const rawCss = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), '');
        const Component: React.FC<{ children?: React.ReactNode; className?: string }> = ({
            children,
            className = '',
        }) => (
            <div className={`styled-loader-wrapper ${className}`}>
                <style dangerouslySetInnerHTML={{ __html: rawCss }} />
                {children}
            </div>
        );
        return Component;
    },
};

interface LoaderProps {
    className?: string;
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({ className = '' }) => {
    const [imgFailed, setImgFailed] = useState(false);

    return (
        <StyledWrapper className={className}>
            <div className="loader">
                <div className="box">
                    <div className="logo">
                        {!imgFailed ? (
                            <img
                                src="/logo.jpg"
                                alt="MMG"
                                className="logo-img"
                                onError={() => setImgFailed(true)}
                            />
                        ) : (
                            <span className="logo-text">MMG</span>
                        )}
                    </div>
                </div>
                <div className="box" />
                <div className="box" />
                <div className="box" />
                <div className="box" />
            </div>
        </StyledWrapper>
    );
};

const StyledWrapper = styled.div`
  .styled-loader-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loader {
    --size: 220px;
    --duration: 2s;
    --logo-color: #3b82f6;
    --background: linear-gradient(
      0deg,
      rgba(50, 50, 50, 0.2) 0%,
      rgba(100, 100, 100, 0.2) 100%
    );
    height: var(--size);
    aspect-ratio: 1;
    position: relative;
  }

  .loader .box {
    position: absolute;
    background: rgba(100, 100, 100, 0.15);
    background: var(--background);
    border-radius: 50%;
    border-top: 1px solid rgba(100, 100, 100, 1);
    box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 10px -0px;
    backdrop-filter: blur(5px);
    animation: ripple var(--duration) infinite ease-in-out;
  }

  .loader .box:nth-child(1) {
    inset: 40%;
    z-index: 99;
  }

  .loader .box:nth-child(2) {
    inset: 30%;
    z-index: 98;
    border-color: rgba(100, 100, 100, 0.8);
    animation-delay: 0.2s;
  }

  .loader .box:nth-child(3) {
    inset: 20%;
    z-index: 97;
    border-color: rgba(100, 100, 100, 0.6);
    animation-delay: 0.4s;
  }

  .loader .box:nth-child(4) {
    inset: 10%;
    z-index: 96;
    border-color: rgba(100, 100, 100, 0.4);
    animation-delay: 0.6s;
  }

  .loader .box:nth-child(5) {
    inset: 0%;
    z-index: 95;
    border-color: rgba(100, 100, 100, 0.2);
    animation-delay: 0.8s;
  }

  .loader .logo {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden;
    user-select: none;
    padding: 3px;
  }

  .loader .logo .logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  }

  .loader .logo .logo-text {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: var(--logo-color);
    text-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
    animation: color-change var(--duration) infinite ease-in-out;
    line-height: 1;
  }

  @keyframes ripple {
    0% {
      transform: scale(1);
      box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 10px -0px;
    }
    50% {
      transform: scale(1.3);
      box-shadow: rgba(0, 0, 0, 0.3) 0px 30px 20px -0px;
    }
    100% {
      transform: scale(1);
      box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 10px -0px;
    }
  }

  @keyframes color-change {
    0% {
      color: var(--logo-color);
      fill: var(--logo-color);
    }
    50% {
      color: #ffffff;
      fill: #ffffff;
      text-shadow: 0 0 18px rgba(96, 165, 250, 0.9);
    }
    100% {
      color: var(--logo-color);
      fill: var(--logo-color);
    }
  }
`;

export default Loader;
