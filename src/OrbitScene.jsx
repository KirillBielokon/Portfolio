import React, { useRef } from "react";
import useSceneActivity from "./useSceneActivity";
import {
  ArrowUpRight,
  Bookmark,
  Heart,
  MoreHorizontal,
  Send,
} from "lucide-react";
import "./orbit-scene.css";

/** A second, lightweight 3D composition: real CSS perspective, no extra GL context. */
export default function OrbitScene({ paused = false, active = true }) {
  const root = useRef(null);
  const { running } = useSceneActivity(root, {
    paused,
    active,
    rootMargin: "40px",
  });
  return (
    <div
      ref={root}
      className="orbit-scene"
      data-running={running}
      aria-hidden="true"
    >
      <div className="oscene-halo" />
      <div className="oscene-grid" />
      <div className="oscene-orbits">
        <i />
        <i />
        <i />
        <b />
        <b />
      </div>
      <div className="oscene-core">
        <div className="oscene-cube">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="oscene-panel oscene-browser">
        <div className="oscene-bar">
          <i />
          <i />
          <i />
          <span>il tuo prossimo sito</span>
        </div>
        <div className="oscene-browser-body">
          <span className="oscene-wordmark">YOU.</span>
          <div className="oscene-mini-nav">
            <i />
            <i />
            <i />
          </div>
          <strong>
            Una bella
            <br />
            <em>direzione.</em>
          </strong>
          <div className="oscene-mini-copy">
            <i />
            <i />
          </div>
          <span className="oscene-mini-cta">
            Scopri il progetto <ArrowUpRight />
          </span>
          <div className="oscene-mini-sculpture">
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <div className="oscene-panel oscene-social">
        <div className="oscene-social-top">
          <i>Y.</i>
          <span>
            La tua identità.<small>In ogni formato.</small>
          </span>
          <MoreHorizontal />
        </div>
        <div className="oscene-posts">
          <span>
            <b>
              Fatti
              <br />
              riconoscere.
            </b>
            <i>
              <ArrowUpRight />
            </i>
          </span>
          <span>
            <i />
            <i />
          </span>
          <span>
            <i />
            <i />
          </span>
          <span>
            <b>
              Stessa idea.
              <br />
              Nuove forme.
            </b>
            <i>
              <svg viewBox="0 0 40 40" fill="none">
                <path
                  d="M20 3V37M3 20H37M8 8L32 32M32 8L8 32"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </i>
          </span>
        </div>
        <div className="oscene-social-bottom">
          <Heart />
          <Send />
          <i />
          <Bookmark />
        </div>
      </div>
      <div className="oscene-chip">
        <span />
        Web & social, coordinati.
      </div>
      <div className="oscene-shine oscene-shine-a" />
      <div className="oscene-shine oscene-shine-b" />
    </div>
  );
}
